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
    <div className="min-h-screen bg-green-100 ">
      <div className="w-full max-w-screen-lg mx-auto flex flex-col border-2  bg-gray-100">
        <Header />
        <div className="w-full ">
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
