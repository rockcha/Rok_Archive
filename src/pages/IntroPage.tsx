// src/app/(whatever)/IntroPage.tsx
"use client";

import SectionShell from "@/features/intro/SectionShell";
import HeroSection from "@/features/intro/HeroSection";
import TechStackSection from "@/features/intro/TechStackSection";
import GamePortfolioSection from "@/features/intro/GamePortfolioSection";
import RokchaArchive from "@/features/intro/RokchaArchive";
import Gamjaring from "@/features/intro/Gamjaring";

import FloatingNoteButton from "@/features/intro/FloatingNoteButton";

export default function IntroPage() {
  return (
    <main className="mx-auto w-full">
      <FloatingNoteButton />
      {/* 1. 히어로 섹션 → 아래로 스크롤: #tech-stack */}
      <SectionShell ctaLabel="기술 스택" ctaHref="#tech-stack">
        <HeroSection />
      </SectionShell>

      {/* 2. 기술 스택 섹션 → 아래로 스크롤: #portfolio */}
      <section id="tech-stack" className="scroll-mt-24">
        <SectionShell ctaLabel="첫 번째 포트폴리오" ctaHref="#portfolio1">
          <TechStackSection />
        </SectionShell>
      </section>

      {/* 3. 포트폴리오 섹션 (앵커 대상) */}
      <section id="portfolio1" className="scroll-mt-24">
        <SectionShell ctaLabel="두번째 포트폴리오" ctaHref="#portfolio2">
          <div className="text-center text-neutral-500">
            <GamePortfolioSection />
          </div>
        </SectionShell>
      </section>

      <section id="portfolio2" className="scroll-mt-24">
        <SectionShell ctaLabel="세번째 포트폴리오" ctaHref="#portfolio3">
          <div className="text-center text-neutral-500">
            <RokchaArchive />
          </div>
        </SectionShell>
      </section>

      <section id="portfolio3" className="scroll-mt-24">
        <SectionShell>
          <div className="text-center text-neutral-500">
            <Gamjaring />
          </div>
        </SectionShell>
      </section>
    </main>
  );
}
