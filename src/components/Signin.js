import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./Signin.css";

axios.defaults.withCredentials = true;

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Attempting to connect to backend...");
      const response = await axios.post("http://localhost:5191/api/users/login", 
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true,
          timeout: 5000 
        }
      );

      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
      if (response.data.success && response.data.data?.auth_token) {
        const token = response.data.data.auth_token;
        console.log("Raw token:", token);
        localStorage.setItem("token", token);
         
        const decodedToken = jwtDecode(token);
        console.log("Full decoded token:", decodedToken);
        console.log("User type from token:", decodedToken.userType);
        console.log("All token properties:", Object.keys(decodedToken));
        console.log("Token claims:", decodedToken);
        
        
        localStorage.setItem("user", JSON.stringify(decodedToken));
        
        
        const role = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        console.log("User role from token:", role);
        
       
        if (role === "Admin") {
          console.log("Redirecting to admin panel");
          navigate("/admin");
        } else if (role === "Owner") {
          console.log("Redirecting to restaurant dashboard");
          navigate("/restaurant-dashboard");
        } else {
          console.log("Redirecting to home page");
          navigate("/home");
        }
      } else {
        setError("Authentication failed. Invalid response structure.");
      }
    } catch (err) {
      console.error("Detailed error:", err);
      if (err.code === 'ECONNREFUSED') {
        setError("Cannot connect to the server. Please make sure the backend server is running.");
      } else if (err.code === 'ERR_NETWORK') {
        setError("Network error. Please check your connection and ensure the backend server is running.");
      } else if (err.response) {
        
        setError(err.response.data?.message || "Invalid credentials. Please try again.");
      } else if (err.request) {
        
        setError("No response from server");
      } else {
        setError("error ");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-container" style={{ position: 'relative', zIndex: 1 }}>
      <h2>Sign In</h2>
      {error && <p className="errors">{error}</p>}
      <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 2 }}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              console.log("Email input changed:", e.target.value);
              setEmail(e.target.value);
            }}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              console.log("Password input changed:", e.target.value);
              setPassword(e.target.value);
            }}
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p>
        Don't have an account? <Link to="/register/user">Register as User</Link> or{" "}
        <Link to="/register/restaurant">Register as Restaurant</Link>
      </p>
    </div>
  );
};

export default SignIn;
