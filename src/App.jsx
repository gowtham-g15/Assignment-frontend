import { useState, useEffect } from "react";
import Login from "./Login.jsx"; // Ensure this is correctly linked
import { motion } from "framer-motion";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(""); // Store the role (user or admin)
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [newAssignment, setNewAssignment] = useState({
    name: "",
    dueDate: "",
    category: "",
    status: "",
    deadline: "",
  });
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Trigger login with role
  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setRole(role); // Store the role after login (user or admin)
  };

  // Fetch assignments from backend
  useEffect(() => {
    if (isLoggedIn) {
      fetchAssignments();
    }
  }, [isLoggedIn]);

  const fetchAssignments = async () => {
    try {
      const res = await fetch("https://assignment-backend-xtxn.onrender.com/assignments");
      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
  };

  const handleChange = (e) => {
    setNewAssignment({ ...newAssignment, [e.target.name]: e.target.value });
  };

  const addAssignment = async () => {
    if (!newAssignment.name || !newAssignment.dueDate || !newAssignment.category || !newAssignment.status || !newAssignment.deadline) {
      alert("Please fill in all fields.");
      return;
    }

    if (editingAssignment) {
      // Update assignment
      await updateAssignment(editingAssignment._id);
    } else {
      // Add new assignment
      await createAssignment();
    }
  };

  const createAssignment = async () => {
    const { name, dueDate, category, status, deadline } = newAssignment;
    try {
      const res = await fetch("https://assignment-backend-xtxn.onrender.com/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, dueDate, category, status, deadline }),
      });
      const newAssignment = await res.json();
      setAssignments([...assignments, newAssignment]);
      setNewAssignment({ name: "", dueDate: "", category: "", status: "", deadline: "" });
    } catch (err) {
      console.error("Error adding assignment:", err);
    }
  };

  const updateAssignment = async (id) => {
    const { name, dueDate, category, status, deadline } = newAssignment;
    try {
      const res = await fetch(`https://assignment-backend-xtxn.onrender.com/assignments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, dueDate, category, status, deadline }),
      });
      const updatedAssignment = await res.json();
      setAssignments(assignments.map((assignment) =>
        assignment._id === id ? updatedAssignment : assignment
      ));
      setNewAssignment({ name: "", dueDate: "", category: "", status: "", deadline: "" });
      setEditingAssignment(null);
    } catch (err) {
      console.error("Error updating assignment:", err);
    }
  };

  const removeAssignment = async (id) => {
    try {
      await fetch(`https://assignment-backend-xtxn.onrender.com/assignments/${id}`, {
        method: "DELETE",
      });
      setAssignments(assignments.filter((assignment) => assignment._id !== id));
    } catch (err) {
      console.error("Error removing assignment:", err);
    }
  };

  const editAssignment = (assignment) => {
    setNewAssignment(assignment);
    setEditingAssignment(assignment);
  };

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) &&
      (filterCategory === "" || assignment.category === filterCategory)
  );

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="container">
      <motion.h1 initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        Assignment Tracker - {role === "admin" ? "Admin Dashboard" : "User Dashboard"}
      </motion.h1>

      {/* Background Video */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src="https://videos.pexels.com/video-files/5192068/5192068-sd_506_960_25fps.mp4" type="video/mp4" />
      </video>

      <div className="controls">
        <input type="text" placeholder="Search Assignment" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Homework">Homework</option>
          <option value="Project">Project</option>
          <option value="Research">Research</option>
          <option value="Lab">Lab</option>
        </select>
      </div>

      {role === "admin" && (
        <div className="add-assignment-form">
          <input type="text" name="name" placeholder="Assignment Name" value={newAssignment.name} onChange={handleChange} />
          <input type="date" name="dueDate" value={newAssignment.dueDate} onChange={handleChange} />
          <select name="category" value={newAssignment.category} onChange={handleChange}>
            <option value="">Select Category</option>
            <option value="Homework">Homework</option>
            <option value="Project">Project</option>
            <option value="Research">Research</option>
            <option value="Lab">Lab</option>
          </select>
          <select name="status" value={newAssignment.status} onChange={handleChange}>
            <option value="">Select Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <input type="datetime-local" name="deadline" value={newAssignment.deadline} onChange={handleChange} />
          <button onClick={addAssignment}>{editingAssignment ? "Update Assignment" : "Add Assignment"}</button>
        </div>
      )}

      <motion.div className="assignment-list">
        {filteredAssignments.map((assignment) => (
          <motion.div key={assignment._id} className="assignment-card" whileHover={{ scale: 1.05 }}>
            <h2>{assignment.name}</h2>
            <p>Due Date: {assignment.dueDate}</p>
            <p>Category: {assignment.category}</p>
            <p>Status: {assignment.status}</p>
            <p>Deadline: {new Date(assignment.deadline).toLocaleString()}</p>
            {role === "admin" && (
              <>
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => editAssignment(assignment)}>Edit</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => removeAssignment(assignment._id)}>Remove</motion.button>
              </>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default App;
