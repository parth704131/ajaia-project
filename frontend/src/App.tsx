import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const EditorPage = lazy(() =>
  import("./pages/EditorPage").then((module) => ({
    default: module.EditorPage,
  })),
);

export function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="grid min-h-screen place-items-center text-ink-500">
            Opening Ajaia Docs…
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/documents/:documentId" element={<EditorPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
