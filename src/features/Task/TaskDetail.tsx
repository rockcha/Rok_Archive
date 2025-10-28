"use client";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  CalendarDays,
  Link as LinkIcon,
  Trash2,
  CheckCircle2,
  CircleX,
} from "lucide-react";
import type { Task } from "./types";
import { faviconUrl } from "./utils";
import { useState } from "react";

/**
 * Task 상세보기 (미니멀 & 예쁘게)
 * - 헤더 라벨에 이모지: 📝 제목 / 🗒️ 메모 / 🔗 링크
 * - 유형 변경 UI 제거 (요청사항)
 * - 완료 토글 버튼 유지
 * - 삭제 버튼은 너무 둥글지 않게 (rounded-md), confirm은 부모에서 처리
 */
export default function TaskDetail({
  task,
  onPatch,
  onDelete,
}: {
  task: Task | null;
  onPatch: (patch: Partial<Task>) => void;
  onDelete: () => void;
}) {
  const [newUrl, setNewUrl] = useState("");

  if (!task)
    return (
      <div className="text-sm text-muted-foreground">
        왼쪽 목록에서 Task를 선택하세요.
      </div>
    );

  const toggleComplete = () => onPatch({ is_completed: !task.is_completed });

  return (
    <div className="space-y-6">
      {/* 제목 */}
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <span>📝</span>
          <span>제목</span>
        </div>
        <Input
          className="mt-2"
          value={task.title}
          onChange={(e) => onPatch({ title: e.target.value })}
          placeholder="제목을 입력하세요"
        />
      </div>

      {/* 메모 */}
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <span>🗒️</span>
          <span>메모</span>
        </div>
        <Textarea
          rows={6}
          className="mt-2 text-sm bg-muted/20 border-none focus:ring-1 focus:ring-primary/30 rounded-xl"
          value={task.memo || ""}
          onChange={(e) => onPatch({ memo: e.target.value })}
          placeholder="세부 메모를 적어주세요"
          spellCheck={false}
        />
      </div>

      {/* 링크 */}
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <span>🔗</span>
          <span>링크</span>
        </div>

        <div className="mt-3 space-y-2">
          {(task.links || []).map((link, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2"
            >
              <img
                src={faviconUrl(link)}
                alt=""
                className="w-4 h-4 rounded-sm opacity-80"
              />
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="truncate underline decoration-dotted text-primary flex-1"
                title={link}
              >
                <LinkIcon className="w-4 h-4 inline mr-1 opacity-80" />
                {link}
              </a>
              <Button
                size="icon"
                variant="ghost"
                className="cursor-pointer"
                onClick={() =>
                  onPatch({
                    links: (task.links || []).filter((_, i) => i !== idx),
                  })
                }
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {/* 링크 추가 */}
          <div className="flex items-center gap-2 border border-dashed border-muted rounded-xl p-2">
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https:// 링크 추가"
            />
            <Button
              variant="outline"
              onClick={() => {
                const url = (newUrl || "").trim();
                if (!url) return;
                onPatch({ links: [...(task.links || []), url] });
                setNewUrl("");
              }}
              className="gap-2 cursor-pointer"
            >
              추가
            </Button>
          </div>
        </div>
      </div>

      {/* 하단 액션: 좌 삭제 / 우 완료 토글 */}
      <div className="flex items-center justify-between pt-2">
        {/* 좌: 삭제 */}
        <Button
          size="sm"
          variant="destructive"
          className="gap-2 rounded-md cursor-pointer"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4" />
          삭제
        </Button>

        {/* 우: 완료 토글 */}
        <Button
          size="sm"
          variant={task.is_completed ? "default" : "outline"}
          className="rounded-full cursor-pointer"
          onClick={toggleComplete}
          title={task.is_completed ? "미완료로 변경" : "완료로 변경"}
        >
          {task.is_completed ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              완료됨
            </>
          ) : (
            <>
              <CircleX className="w-4 h-4 mr-2" />
              미완료
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
