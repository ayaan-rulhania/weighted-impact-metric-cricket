import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import AboutPage from "./pages/AboutPage";
import DataPage from "./pages/DataPage";
import EnginePage from "./pages/EnginePage";
import HomePage from "./pages/HomePage";

const DOC_TITLE = "WIM Cricket Engine";

function TitleSync() {
  useEffect(() => {
    document.title = DOC_TITLE;
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <TitleSync />
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/engine" element={<EnginePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
