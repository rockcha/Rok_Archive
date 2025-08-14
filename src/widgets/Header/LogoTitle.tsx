// src/widgets/LogoTitle.tsx
import { CyclingHighlighter } from "./Cycling-highlighter";

export default function LogoTitle() {
  return (
    <div className="flex ">
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-bold text-green-900">록차 아카이브</span>
        <p className="text-sl ml-10">
          정록이의 소소한&emsp;
          <CyclingHighlighter holdMs={5000}>개발 기록</CyclingHighlighter>
        </p>
      </div>
    </div>
  );
}
