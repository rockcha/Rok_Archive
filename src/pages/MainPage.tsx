// src/pages/MainPage.tsx
import TechCloud from "@/widgets/TechCloud";
import IntroCard from "@/widgets/IntroCard";
import RotatingQuotes from "@/widgets/RotatingQuotes";

export default function MainPage() {
  return (
    <div className="min-h-screen  flex flex-col items-center ">
      <IntroCard />
      {/* intro section */}
      {/* 명언 섹선 */}
      <section className="h-[8rem] flex items-center border">
        <RotatingQuotes />
      </section>
      <div className="flex">
        {/* hero section */}
        <section className="border-2">
          <TechCloud />
        </section>
        {/* sidebar section */}
        <section></section>
      </div>
    </div>
  );
}
