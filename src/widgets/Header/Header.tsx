import AdminLoginButton from "@/features/Auth/AdminLoginButton";
import LogoTitle from "./LogoTitle";
import RotatingQuotes from "../RotatingQuotes";

export default function Header() {
  return (
    <header className=" h-24 w-full mx-auto sticky top-0 min-w-[42rem]  bg-white/90 flex items-center justify-between border-b-2  px-8 py-4 z-50 mb-4 ">
      <LogoTitle />
      <RotatingQuotes />
      <AdminLoginButton />
    </header>
  );
}
