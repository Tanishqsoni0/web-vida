import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { database, ref, push } from "./firebaseConfig"; // Firebase imports
import "./App.css";

const questions = [
  { id: 1, type: "mcq", question: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], answer: "Paris" },
  { id: 2, type: "text", question: "Who developed the theory of relativity?", answer: "Einstein" },
  { id: 3, type: "mcq", question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4" },
];

export default function QuizPage() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState(localStorage.getItem("teamName") || "Unknown Team"); // ✅ Store team name in state
 
  useEffect(() => {
    const storedTeamName = localStorage.getItem("teamName");
    if (storedTeamName) {
      setTeamName(storedTeamName);
    } else {
      setTeamName("Unknown Team"); // Default if not found
    }
  }, []);
 
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTime = localStorage.getItem(`quizTimeLeft_${teamName}`);
    return savedTime ? parseInt(savedTime) : 30 * 60; // 30 minutes
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // ✅ Fix: Check if the quiz was submitted before
  useEffect(() => {
    const storedTeamName = localStorage.getItem("teamName") || "Unknown Team";
    const isSubmitted = localStorage.getItem(`quizSubmitted_${storedTeamName}`);
    const storedScore = localStorage.getItem(`quizScore_${storedTeamName}`);

    if (isSubmitted && storedScore !== null) {
      setSubmitted(true);
      setScore(storedScore);
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit(); // Auto-submit when time runs out
      return;
    }
  
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        localStorage.setItem(`quizTimeLeft_${teamName}`, newTime); // Store team-specific time
        return newTime;
      });
    }, 1000);
  
    return () => clearInterval(timer);
  }, [timeLeft]);
  
  const handleAnswer = (e) => {
    setAnswers({ ...answers, [currentQuestion]: e.target.value });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  // ✅ Fix: Make sure scoring is correct
  const calculateScore = () => {
    let totalScore = 0;
    questions.forEach((q, index) => {
      if (answers[index] && answers[index].toLowerCase() === q.answer.toLowerCase()) {
        if (index === 0) totalScore += 100; // Question 1 → 100 points
        else if (index === 1) totalScore += 200; // Question 2 → 200 points
        else if (index === 2) totalScore += 400; // Question 3 → 400 points
      }
    });
    return totalScore;
  };

  // ✅ Fix: Ensure `teamName` is defined
  const handleSubmit = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setSubmitted(true);

    const storedTeamName = localStorage.getItem("teamName") || "Unknown Team"; // Fix here

    localStorage.setItem(`quizSubmitted_${storedTeamName}`, "true");
    localStorage.setItem(`quizScore_${storedTeamName}`, finalScore);
    localStorage.removeItem(`quizTimeLeft_${storedTeamName}`);

    try {
      const dbRef = ref(database, `quizResults/${storedTeamName}`);
      await push(dbRef, { teamName: storedTeamName, answers, score: finalScore });
    } catch (error) {
      console.error("Error saving results:", error);
    }
  };

  return (
    <div className="quiz-container">
      {submitted ? (
        <div className="score-screen">
          <h2>Quiz Completed!</h2>
          <p>Your Score: <strong>{score} points</strong></p>
        </div>
      ) : (
        <>
          <div className="timer">Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}</div>
          <div className="question-box">
            <h2>{questions[currentQuestion].question}</h2>
            {questions[currentQuestion].type === "mcq" ? (
              <div className="options">
                {questions[currentQuestion].options.map((option, index) => (
                  <label key={index} className="option">
                    <input type="radio" name={`q${currentQuestion}`} value={option} onChange={handleAnswer} checked={answers[currentQuestion] === option} />
                    {option}
                  </label>
                ))}
              </div>
            ) : (
              <input type="text" value={answers[currentQuestion] || ""} onChange={handleAnswer} className="text-input" />
            )}
          </div>
          <div className="buttons">
            <button onClick={prevQuestion} disabled={currentQuestion === 0}>Previous</button>
            {currentQuestion < questions.length - 1 ? <button onClick={nextQuestion}>Next</button> : <button onClick={handleSubmit}>Submit</button>}
          </div>
        </>
      )}
    </div>
  );
}
