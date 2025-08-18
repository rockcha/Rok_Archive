// src/widgets/LogoTitle.tsx
import { Button } from "@/shared/ui/button";
import { CyclingHighlighter } from "./Cycling-highlighter";
import { useNavigate, useLocation } from "react-router-dom";

export default function LogoTitle() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleOnClick = () => {
    if (location.pathname !== "/") {
      navigate("/");
      return;
    }
  };

  return (
    <div className="flex ">
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          className="text-3xl font-bold text-green-900 hover:cursor-pointer "
          onClick={handleOnClick}
        >
          록차 아카이브
        </Button>

        <p>
          &emsp;정록이의 소소한&emsp;
          <CyclingHighlighter holdMs={5000}>개발 기록</CyclingHighlighter>
        </p>
      </div>
    </div>
  );
}
