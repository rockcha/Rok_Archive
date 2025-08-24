"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import LinksModal from "./LinksModal";

export default function FloatingLinksButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 고정된 원형 버튼 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-12 z-50
                   h-14 w-14 rounded-full
                   bg-black text-white
                   shadow-lg hover:opacity-90
                   flex items-center justify-center"
        aria-label="Open links"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* 모달 */}
      {open && <LinksModal open={open} onOpenChange={setOpen} />}
    </>
  );
}
