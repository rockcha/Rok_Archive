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

//위젯 목록
import Header from "@/widgets/Header/Header";

// 레이아웃 (Header + Footer 고정)
function Layout() {
  return (
    <div className="h-screen overflow-hidden">
      {" "}
      {/* ✅ 화면 높이 고정 + 전역 스크롤 차단 */}
      <div className="h-full max-w-screen-2xl mx-auto flex flex-col bg-stone-50">
        {/* Header는 한 줄로 차지하고 */}
        <div className="shrink-0">
          <Header />
        </div>

        {/* 나머지 영역을 1fr로: 내부 스크롤만 허용하려면 min-h-0 필수 */}
        <div className="flex-1 min-h-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/posts/new" element={<PostCreatePage />} />
          <Route path="/posts/:slug" element={<PostDetailPage />} />
          <Route path="/posts/id/:id" element={<PostDetailPage />} />
          <Route path="/posts/edit/:id" element={<PostEditPage />} />
          <Route path="/schedular" element={<SchedularPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
