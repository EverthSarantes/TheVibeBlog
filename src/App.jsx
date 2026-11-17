import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Spinner from "./components/ui/Spinner";

const Home = lazy(() => import("./pages/Home"));
const Article = lazy(() => import("./pages/Article"));
const Editor = lazy(() => import("./pages/Editor"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const Search = lazy(() => import("./pages/Search"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return <div className="py-32"><Spinner /></div>;
}

export default function App() {
  return (
    <BrowserRouter basename={(() => {
      const envBase = (import.meta.env.VITE_BASE_PATH || "/").replace(/\/$/, "");
      const currentPath = window.location.pathname;
      // If the current path starts with the configured base, use it (GitHub Pages)
      if (envBase && envBase !== "/" && currentPath.startsWith(envBase)) {
        return envBase;
      }
      // Otherwise use root (Firebase Hosting, Vercel, Netlify, etc.)
      return "/";
    })()}>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:slug" element={<Article />} />
            <Route path="/write" element={<Editor />} />
            <Route path="/edit/:id" element={<Editor />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/u/:uid" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<Search />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}