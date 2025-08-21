import AdminLoginButton from "@/features/Auth/AdminLoginButton";
import AdminDock from "../AdminDock";

export default function Header() {
  return (
    <header
      className="
        relative w-full mx-auto min-w-[42rem]
        bg-neutral-200 border-b-2 px-6 py-2
      "
    >
      {/* 좌/우 레일: 가운데 Dock은 절대배치로 분리 */}
      <div className="flex items-center justify-between">
        {/* 왼쪽: 로고/타이틀 */}
        <h1 className="text-3xl font-bold text-green-900 shrink-0">
          록차 아카이브
        </h1>
        {/* 로고 컴포넌트가 있을 경우 */}
        {/* <div className="shrink-0"><LogoTitle /></div> */}

        <AdminLoginButton />
      </div>

      {/* 가운데 고정: 레이아웃에 영향 X (absolute + pointer-events 제어) */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="pointer-events-auto">
          <AdminDock />
        </div>
      </div>
    </header>
  );
}
