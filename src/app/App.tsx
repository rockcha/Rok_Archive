// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";

// 페이지 목록
import MainPage from "@/pages/MainPage";
import PostCreatePage from "@/pages/PostCreatePage";
import PostDetailPage from "@/pages/PostDetailPage";
import PostEditPage from "@/pages/PostEditPage";
import SchedularPage from "@/pages/SchedularPage";
import TodayTodosPage from "@/pages/TodayTodosPage";
// import IntroPage from "@/pages/IntroPage";  //포폴용

//위젯 목록
import Header from "@/widgets/Header/Header";
import { Toaster } from "@/shared/ui/sonner";
import FloatingMemo from "@/widgets/FloatingMemo";
import FloatingTodo from "@/widgets/FloatingTodo";
import ReactStudyTaskPage from "@/features/ReactStudy/ReactStudyTaskPage";
import Rps14 from "@/features/ReactStudy/rps-1-4/Rps14";
import Rps56 from "@/features/ReactStudy/rps-1-4/rps56";
import TaskPage from "@/features/Task/TaskPage";
import Weather79 from "@/features/ReactStudy/Weather79";

// 레이아웃 (Header + Footer 고정)
function Layout() {
  return (
    <div className=" bg-neutral-100 ">
      <div className="h-full max-w-screen-3xl mx-auto flex flex-col ">
        <Header />

        <FloatingMemo />
        <FloatingTodo />

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
    <div className=" mx-auto  max-w-screen-xl bg-neutral-100 px-6 py-6  ">
      {/* 고정 위젯 (뷰포트 기준 fixed) */}

      {/* 페이지 콘텐츠 */}
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      {/* 전역 위젯 */}
      <Toaster />

      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/main" replace />} />
          <Route path="/main" element={<MainPage />} />
        </Route>
        <Route element={<ContainerLayout />}>
          <Route path="/schedular" element={<SchedularPage />} />
          <Route path="/todos" element={<TodayTodosPage />} />
          <Route path="/tasks" element={<TaskPage />} />
          <Route path="/posts/new" element={<PostCreatePage />} />
          <Route path="/posts/:slug" element={<PostDetailPage />} />
          <Route path="/posts/id/:id" element={<PostDetailPage />} />
          <Route path="/posts/edit/:id" element={<PostEditPage />} />

          <Route path="/study" element={<ReactStudyTaskPage />} />
          <Route path="/tasks/rps-1-4" element={<Rps14 />} />
          <Route path="/tasks/rps-5-6" element={<Rps56 />} />
          <Route path="/tasks/weather-7-9" element={<Weather79 />} />
        </Route>
      </Routes>
    </Router>
  );
}
