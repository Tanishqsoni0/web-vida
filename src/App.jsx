import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import FormPage from "./FormPage";
import QuizPage from "./QuizPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FormPage />} />
        <Route path="/quiz" element={<QuizPage />} />
      </Routes>
    </Router>
  );
}
