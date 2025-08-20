import AdminLoginButton from "@/features/Auth/AdminLoginButton";
import LogoTitle from "./LogoTitle";
import AdminDock from "../AdminDock";
import TodoList from "../TodoList";

export default function Header() {
  return (
    <header className="relative w-full mx-auto min-w-[42rem] bg-neutral-200 border-b-2 flex items-center justify-between px-4 py-2 z-50">
      <LogoTitle />

      {/* 중앙 배치 */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <AdminDock />
      </div>
      <TodoList />
      <AdminLoginButton />
    </header>
  );
}
