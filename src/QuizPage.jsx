import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { database, ref, push, get } from "./firebaseConfig"; // Firebase imports
import "./App.css";

const questions = [
  { id: 1, type: "mcq", question: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], answer: "Paris" },
  { id: 2, type: "text", question: "Who developed the theory of relativity?", answer: "Einstein" },
  { id: 3, type: "mcq", question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4" },
];

export default function QuizPage() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState(localStorage.getItem("teamName") || "Unknown Team");
  const [timeLeft, setTimeLeft] = useState(30 * 60);

useEffect(() => {
  const savedTime = localStorage.getItem(`quizTimeLeft_${teamName}`);
  if (savedTime) {
    setTimeLeft(parseInt(savedTime));
  }
}, [teamName]); // Update when teamName is loaded

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchTeamName = async () => {
      try {
        const dbRef = ref(database, "teams"); // Change to the correct path in Firebase
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          const teamsData = snapshot.val();
          const lastTeam = Object.values(teamsData).pop(); // Assuming the last added team is the one playing
          setTeamName(lastTeam.teamName);
        }
      } catch (error) {
        console.error("Error fetching team name:", error);
      }
    };
  
    fetchTeamName();
  }, []);
  
  // useEffect(() => {
  //   const storedTeamName = localStorage.getItem("teamName") || "Unknown Team";
  //   const isSubmitted = localStorage.getItem(`quizSubmitted_${storedTeamName}`);
  //   const storedScore = localStorage.getItem(`quizScore_${storedTeamName}`);

  //   if (isSubmitted && storedScore !== null) {
  //     setSubmitted(true);
  //     setScore(parseInt(storedScore));
  //     fetchLeaderboard(); // Fetch leaderboard if already submitted
  //   }
  // }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        localStorage.setItem(`quizTimeLeft_${teamName}`, newTime);
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

  const calculateScore = () => {
    let totalScore = 0;
    questions.forEach((q, index) => {
      if (answers[index] && answers[index].toLowerCase() === q.answer.toLowerCase()) {
        if (index === 0) totalScore += 100;
        else if (index === 1) totalScore += 200;
        else if (index === 2) totalScore += 400;
      }
    });
    return totalScore;
  };

  const handleSubmit = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setSubmitted(true);

    if (!teamName) {
      console.error("Team name not found. Cannot submit quiz.");
      return;
    }

    localStorage.setItem(`quizSubmitted_${teamName}`, "true");
    localStorage.setItem(`quizScore_${teamName}`, finalScore);
    localStorage.removeItem(`quizTimeLeft_${teamName}`);

    try {
      const dbRef = ref(database, `quizResults/${teamName}`);
      await push(dbRef, { teamName, score: finalScore });

      fetchLeaderboard();
    } catch (error) {
      console.error("Error saving results:", error);
    }
  };


  const fetchLeaderboard = async () => {
    try {
      const dbRef = ref(database, "quizResults");
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        const teams = [];
        snapshot.forEach((teamSnap) => {
          teamSnap.forEach((entry) => {
            teams.push(entry.val());
          });
        });
        teams.sort((a, b) => b.score - a.score); // Sort leaderboard by score
        setLeaderboard(teams);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  return (
    <div className="quiz-container">
      {submitted ? (
        <div className="score-screen">
          <h2>Quiz Completed!</h2>
          <p>Your Score: <strong>{score} points</strong></p>

          <h2>Leaderboard</h2>
          <ul className="leaderboard">
            {leaderboard.map((team, index) => (
              <li key={index}>
                <strong>{index + 1}. {team.teamName}</strong> - {team.score} points
              </li>
            ))}
          </ul>
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
