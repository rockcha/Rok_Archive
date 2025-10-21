import ReactStudyTaskItem from "./ReactStudyTaskItem";
import { Separator } from "@/shared/ui/separator";
import { BookOpenCheck } from "lucide-react";

const sections = [
  {
    week: "1주차",
    items: [
      {
        title: "가위바위 보게임 1~4 — 4가지의 결과물",
        dueDate: "2025-10-21",
        difficulty: "중" as const,
        href: "/tasks/rps-1-4",
      },
      {
        title: "가위바위보 게임 5~6 — 최종 결과물",
        dueDate: "2025-10-22",
        difficulty: "중" as const,
        href: "/tasks/rps-5-6",
      },
      {
        title: "날씨앱 만들기 1~6강 — 6강까지의 코드 제출",
        dueDate: "2025-10-24",
        difficulty: "약" as const,
        href: "/tasks/weather-1-6",
      },
      {
        title: "날씨앱 만들기 7~9강 — 최종 결과물 제출",
        dueDate: "2025-10-25",
        difficulty: "중" as const,
        href: "/tasks/weather-7-9",
      },
    ],
  },
  {
    week: "2주차",
    items: [
      {
        title: "쇼핑몰 페이지 만들기 1~5강 — 5까지 결과물 제출",
        dueDate: "2025-10-28",
        difficulty: "중" as const,
        href: "/tasks/shop-1-5",
      },
      {
        title: "쇼핑몰 페이지 만들기 6~9강 — 9탄까지 완성한 최종 결과물",
        dueDate: "2025-10-29",
        difficulty: "중" as const,
        href: "/tasks/shop-6-9",
      },
      {
        title: "쇼핑몰 페이지 만들기 10~13 — 최종 결과물(도전과제 포함)",
        dueDate: "2025-10-30",
        difficulty: "중" as const,
        href: "/tasks/shop-10-13",
      },
      {
        title: "zustand 1~2 — 카운터 완료",
        dueDate: "2025-11-01",
        difficulty: "약" as const,
        href: "/tasks/zustand-1-2",
      },
      {
        title: "연락처 페이지 만들기 1~8강 — 연락처 페이지 완료",
        dueDate: "2025-11-02",
        difficulty: "중" as const,
        href: "/tasks/contacts-1-8",
      },
    ],
  },
  {
    week: "3주차",
    items: [
      {
        title: "넷플릭스 1~5강 — 결과물 도메인 제출",
        dueDate: "2025-11-07",
        difficulty: "중" as const,
        href: "/tasks/netflix-1-5",
      },
      {
        title: "넷플릭스 6~7강 — 결과물 도메인 제출",
        dueDate: "2025-11-08",
        difficulty: "강" as const,
        href: "/tasks/netflix-6-7",
      },
      {
        title: "넷플릭스 8~9강 — 결과물 도메인 제출",
        dueDate: "2025-11-09",
        difficulty: "강" as const,
        href: "/tasks/netflix-8-9",
      },
    ],
  },
  {
    week: "4주차",
    items: [
      {
        title: "넷플릭스 10~12강 — 결과물 도메인 제출",
        dueDate: "2025-11-10",
        difficulty: "강" as const,
        href: "/tasks/netflix-10-12",
      },
      {
        title: "넷플릭스 13~14강 — 결과물 도메인 제출",
        dueDate: "2025-11-11",
        difficulty: "강" as const,
        href: "/tasks/netflix-13-14",
      },
      {
        title: "최종 마무리 — 결과물 도메인 제출",
        dueDate: "2025-11-13",
        difficulty: "강" as const,
        href: "/tasks/final-1",
      },
      {
        title: "최종 마무리 — 결과물 도메인 제출",
        dueDate: "2025-11-14",
        difficulty: "강" as const,
        href: "/tasks/final-2",
      },
    ],
  },
];

export default function ReactStudyTaskPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 mt-4 flex flex-col gap-2 sm:mt-8">
        <div className="inline-flex items-center gap-3 text-sky-700">
          <BookOpenCheck className="size-6" aria-hidden />
          <span className="text-sm font-semibold tracking-wide">
            리액트 스터디 4기
          </span>
        </div>
        <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">
          오정록 과제 목록
        </h1>
        <p className="text-sm text-slate-600">
          네모 큰 정사각형 카드를 눌러 각 과제 상세 페이지로 이동합니다.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-12">
        {sections.map((section) => (
          <section key={section.week}>
            <header className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {section.week}
              </h2>
              <Separator className="ml-4 flex-1" />
            </header>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {section.items.map((item, idx) => (
                <ReactStudyTaskItem
                  key={`${section.week}-${idx}`}
                  week={section.week}
                  title={item.title}
                  dueDate={item.dueDate}
                  difficulty={item.difficulty}
                  href={item.href}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="h-12" />
    </div>
  );
}
