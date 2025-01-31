import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("user"); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    const url = isRegister ? "https://assignment-backend-xtxn.onrender.com/register" : "https://assignment-backend-xtxn.onrender.com/login";

    try {
      setIsLoading(true);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }), // Send role along with email and password
      });

      const data = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        setError(data.error);
      } else {
        alert(isRegister ? "Registered Successfully! Please login." : "Login Successful!");
        if (!isRegister) {
          onLogin(data.role);
        } else {
          setIsRegister(false);
        }
      }
    } catch (err) {
      setIsLoading(false);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegister ? "Register" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        {/* Role Selection for Register */}
        {isRegister && (
          <div>
            <label>
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === "admin"}
                onChange={(e) => setRole(e.target.value)}
              />
              Admin
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="user"
                checked={role === "user"}
                onChange={(e) => setRole(e.target.value)}
              />
              User
            </label>
          </div>
        )}
        
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? (isRegister ? "Registering..." : "Logging In...") : (isRegister ? "Register" : "Login")}
        </button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Go to Login" : "Go to Register"}
      </button>
    </div>
  );
};

export default Login;
