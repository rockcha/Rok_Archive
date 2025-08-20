// src/widgets/LogoTitle.tsx
import { Button } from "@/shared/ui/button";

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
    <Button
      variant="ghost"
      className=" text-3xl font-bold text-green-900 hover:cursor-pointer "
      onClick={handleOnClick}
    >
      록차 아카이브🌿
    </Button>
  );
}
