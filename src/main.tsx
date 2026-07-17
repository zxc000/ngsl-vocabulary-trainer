import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, NavLink, Route, Routes } from "react-router-dom";
import { BarChart3, BookOpen, ClipboardCheck, Database, Home, Search } from "lucide-react";
import App from "./pages/App";
import Study from "./pages/Study";
import Screening from "./pages/Screening";
import WordList from "./pages/WordList";
import Stats from "./pages/Stats";
import "./styles.css";

const navItems = [
  { to: "/", label: "首頁", icon: Home },
  { to: "/study", label: "學習", icon: BookOpen },
  { to: "/screening", label: "篩選", icon: ClipboardCheck },
  { to: "/words", label: "詞表", icon: Search },
  { to: "/stats", label: "統計", icon: BarChart3 }
];

function Shell() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-paper text-ink">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-white">
                <Database size={21} aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-semibold leading-tight">NGSL Vocabulary Trainer</h1>
                <p className="text-sm text-muted">本機優先的 NGSL 2,809 核心英文單字訓練工具。</p>
              </div>
            </div>
            <nav className="grid grid-cols-5 gap-2 sm:flex" aria-label="主要導覽">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-center text-xs font-medium leading-tight transition sm:min-h-0 sm:flex-row sm:gap-2 sm:px-3 sm:text-sm",
                        isActive ? "bg-ink text-white" : "text-muted hover:bg-slate-100 hover:text-ink"
                      ].join(" ")
                    }
                    title={item.label}
                  >
                    <Icon size={17} aria-hidden="true" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/study" element={<Study />} />
            <Route path="/screening" element={<Screening />} />
            <Route path="/words" element={<WordList />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Shell />
  </React.StrictMode>
);
