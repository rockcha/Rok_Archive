import AdminLoginButton from "@/features/Auth/AdminLoginButton";
import LogoTitle from "./LogoTitle";
import RotatingQuotes from "../RotatingQuotes";

export default function Header() {
  return (
    <header className=" h-24 w-full mx-auto  sticky top-0 min-w-[42rem]  bg-green-100 flex items-center justify-between border-b-2 border-black  px-8  z-50 ">
      <LogoTitle />
      <RotatingQuotes />
      <AdminLoginButton />
    </header>
  );
}
