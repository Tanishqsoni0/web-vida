import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { database, ref, push } from "./firebaseConfig";
import "./App.css";

export default function FormPage() {
  const [formData, setFormData] = useState({
    teamName: "",
    leaderName: "",
    rollNo: "",
    phoneNo: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.teamName && formData.leaderName && formData.rollNo && formData.phoneNo) {
      try {
        const dbRef = ref(database, "teams");
        await push(dbRef, formData);
        navigate("/quiz"); // Redirect to quiz page
      } catch (error) {
        console.error("Error saving data:", error);
      }
    } else {
      alert("Please fill all fields");
    }
  };

  return (
    <div className="container">
      <div className="form-box">
        <h2 className="title">Team Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Team Name</label>
            <input type="text" name="teamName" value={formData.teamName} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Leader Name</label>
            <input type="text" name="leaderName" value={formData.leaderName} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Roll No</label>
            <input type="text" name="rollNo" value={formData.rollNo} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Phone No</label>
            <input type="tel" name="phoneNo" value={formData.phoneNo} onChange={handleChange} required />
          </div>
          <button type="submit" className="submit-btn">Start Quiz</button>
        </form>
      </div>
    </div>
  );
}
