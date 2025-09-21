import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TaskBoardPage from "@/pages/TaskBoardPage";
import TaskDetailPage from "@/pages/TaskDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        <Route path="/tasks" element={<TaskBoardPage />} />
        <Route path="/task/:taskId" element={<TaskDetailPage />} />
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
