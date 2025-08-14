// src/features/posts/editor/uploadImage.ts
import type { Editor } from "@tiptap/react";
import { supabase } from "@/shared/lib/supabase";
import { STORAGE_BUCKET } from "@/features/posts/constants";

// ✅ tempId 에 따라 objectURL을 추적
const TEMP_BLOBS = new Map<string, string>();

export async function insertImagesWithImmediatePreview(
  editor: Editor,
  files: File[],
  maxMB = 8
) {
  const imgType = editor.view.state.schema.nodes.image;

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`이미지 최대 ${maxMB}MB까지 업로드 가능합니다.`);
      continue;
    }

    const tempId = crypto.randomUUID();
    const objectUrl = URL.createObjectURL(file);
    TEMP_BLOBS.set(tempId, objectUrl);

    // 1) 즉시 미리보기 삽입
    editor
      .chain()
      .focus()
      .insertContent({
        type: "image",
        attrs: {
          src: objectUrl,
          alt: file.name,
          "data-temp-id": tempId,
          "data-loading": "true",
        },
      })
      .run();

    try {
      // 2) 업로드
      const path = `posts/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { upsert: false });
      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

      // 3) 성공 → 해당 노드의 src 교체 & 로딩속성 제거
      editor.commands.command(({ tr, state }) => {
        state.doc.descendants((node, pos) => {
          if (node.type === imgType && node.attrs["data-temp-id"] === tempId) {
            tr.setNodeMarkup(pos, imgType, {
              ...node.attrs,
              src: publicUrl,
              "data-temp-id": null,
              "data-loading": null,
            });
          }
        });
        editor.view.dispatch(tr);
        return true;
      });

      // ✅ 이제 blob 해제 (한 틱 늦게)
      const blob = TEMP_BLOBS.get(tempId);
      if (blob) {
        setTimeout(() => URL.revokeObjectURL(blob), 0);
        TEMP_BLOBS.delete(tempId);
      }
    } catch (e) {
      // 실패 → 노드 삭제
      editor.commands.command(({ tr, state }) => {
        state.doc.descendants((node, pos) => {
          if (node.type === imgType && node.attrs["data-temp-id"] === tempId) {
            tr.delete(pos, pos + node.nodeSize);
          }
        });
        editor.view.dispatch(tr);
        return true;
      });

      // ✅ 실패 시에도 blob 해제 (한 틱 늦게)
      const blob = TEMP_BLOBS.get(tempId);
      if (blob) {
        setTimeout(() => URL.revokeObjectURL(blob), 0);
        TEMP_BLOBS.delete(tempId);
      }

      alert("이미지 업로드 실패");
    }
  }
}
