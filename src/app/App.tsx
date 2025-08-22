// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

// 페이지 목록
import MainPage from "@/pages/MainPage";
import PostCreatePage from "@/pages/PostCreatePage";
import PostDetailPage from "@/pages/PostDetailPage";
import PostEditPage from "@/pages/PostEditPage";
import SchedularPage from "@/pages/SchedularPage";
import TodayTodosPage from "@/pages/TodayTodosPage";

//위젯 목록
import Header from "@/widgets/Header/Header";
import { Toaster } from "@/shared/ui/sonner";
import FloatingMemo from "@/widgets/FloatingMemo";
import HomeButton from "@/widgets/Header/HomeButton";

// 레이아웃 (Header + Footer 고정)
function Layout() {
  return (
    <div className="h-dvh bg-neutral-100 overflow-hidden">
      <div className="h-full max-w-screen-2xl mx-auto flex flex-col ">
        <div className="shrink-0">
          <Header />
        </div>

        {/* 내부 스크롤 전용 영역 */}
        <main className="flex-1 min-h-0  min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function ContainerLayout() {
  return (
    <div className=" mx-auto  max-w-screen-lg bg-neutral-100 px-6 py-6 h-dvh overflow-hidden ">
      {/* 고정 위젯 (뷰포트 기준 fixed) */}
      <FloatingMemo />
      <HomeButton />

      {/* 페이지 콘텐츠 */}
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster />

      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<MainPage />} />
        </Route>
        <Route element={<ContainerLayout />}>
          <Route path="/schedular" element={<SchedularPage />} />
          <Route path="/todos" element={<TodayTodosPage />} />
          <Route path="/posts/new" element={<PostCreatePage />} />
          <Route path="/posts/:slug" element={<PostDetailPage />} />
          <Route path="/posts/id/:id" element={<PostDetailPage />} />
          <Route path="/posts/edit/:id" element={<PostEditPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
