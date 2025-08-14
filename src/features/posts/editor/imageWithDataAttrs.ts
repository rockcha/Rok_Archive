// src/features/posts/editor/ImageWithDataAttrs.ts
import Image from "@tiptap/extension-image";

export const ImageWithDataAttrs = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-temp-id": { default: null },
      "data-loading": { default: null },
    };
  },
});
