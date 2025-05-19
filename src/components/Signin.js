import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { generateToken } from "./firebase";
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
  
      if (response.data.success && response.data.data?.auth_token) {
        const backendToken = response.data.data.auth_token;
        localStorage.setItem("token", backendToken);
  
        const decodedToken = jwtDecode(backendToken);
        localStorage.setItem("user", JSON.stringify(decodedToken));
  
        const role = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  
        // ✅ Get FCM token from Firebase
        const fcmToken = await generateToken();
        if (fcmToken) {
          console.log("FCM Token:", fcmToken);
  
          // ✅ Send FCM token to backend
          try {
            const fcmResponse = await axios.post("http://localhost:5191/api/users/save-firebase-token",
              { firebaseToken: fcmToken },
              {
                headers: {
                  'Authorization': `Bearer ${backendToken}`,  // if your backend uses bearer auth
                  'Content-Type': 'application/json'
                },
                timeout: 5000
              }
            );
            console.log("FCM token sent successfully:", fcmResponse.data);
          } catch (fcmError) {
            console.error("Failed to send FCM token:", fcmError);
          }
        }
  
        // ✅ Navigate based on role
        if (role === "Admin") navigate("/admin");
        else if (role === "Owner") navigate("/restaurant-dashboard");
        else navigate("/home");
  
      } else {
        setError("Authentication failed. Invalid response structure.");
      }
    } catch (err) {
      console.error("Error during sign in:", err);
      if (err.code === 'ECONNREFUSED') {
        setError("Cannot connect to the server. Please make sure the backend server is running.");
      } else if (err.code === 'ERR_NETWORK') {
        setError("Network error. Please check your connection.");
      } else if (err.response) {
        setError(err.response.data?.message || "Invalid credentials.");
      } else {
        setError("Unexpected error occurred.");
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
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
