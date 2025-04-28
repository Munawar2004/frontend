import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  
  useEffect(() => {
    console.log("Register component mounted");
    
   
    const handleDocumentClick = (e) => {
      console.log("Document clicked:", e.target);
    };
    
    document.addEventListener("click", handleDocumentClick);
    
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);


  const handleNameChange = (e) => {
    e.stopPropagation();
    const value = e.target.value;
    console.log("Name input clicked");
    console.log("Name changed:", value);
    setName(value);
  };

  const handleEmailChange = (e) => {
    e.stopPropagation();
    const value = e.target.value;
    console.log("Email input clicked");
    console.log("Email changed:", value);
    setEmail(value);
  };

  const handlePhoneChange = (e) => {
    e.stopPropagation();
    const value = e.target.value;
    console.log("Phone input clicked");
    console.log("Phone changed:", value);
    setPhone(value);
  };

  const handlePasswordChange = (e) => {
    e.stopPropagation();
    const value = e.target.value;
    console.log("Password input clicked");
    console.log("Password changed:", value);
    setPassword(value);
  };

  const handleInputClick = (e) => {
    e.stopPropagation();
    console.log("Input clicked:", e.target.id);
  };

  /**
   * Handles form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");

    const formData = {
      name,
      email,
      phone,
      password
    };

    try {
      
      console.log("Sending registration data:", formData);
      
      const response = await axios.post("http://localhost:5191/api/users", formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alert("🎉 Registration successful! Please sign in.");
        navigate("/");
      }
    } catch (err) {
      console.error("Registration error:", err);
  
      console.log("Full error response:", JSON.stringify(err.response?.data, null, 2));
      
      if (err.response?.status === 400) {
        if (err.response?.data?.errors) {
         
          const validationErrors = err.response.data.errors;
          console.log("Validation errors:", validationErrors);
          let errorMessage = "Please fix the following errors:\n";
          Object.entries(validationErrors).forEach(([field, errors]) => {
            errorMessage += `\n${field}:\n`;
            errors.forEach(error => {
              errorMessage += `- ${error}\n`;
            });
          });
          
          setError(errorMessage);
        } else if (err.response?.data?.message?.includes("email already exists")) {
          setEmailError("⚠️ Email is already in use. Try another one.");
        } else {
          setError(err.response.data.message || "❌ Invalid registration data. Please check your input.");
        }
      } else {
        setError("❌ Registration failed. Please try again later.");
      }
    }
  };

  return (
    <div className="register-container" style={{ 
      maxWidth: '400px',
      margin: '50px auto',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
      position: 'relative',
      zIndex: 1
    }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Register as User</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '15px', position: 'relative', zIndex: 2 }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
          <input 
            id="name"
            type="text" 
            value={name} 
            onChange={handleNameChange}
            onClick={handleInputClick}
            required 
            autoComplete="off"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              fontSize: '14px',
              boxSizing: 'border-box',
              position: 'relative',
              zIndex: 3
            }}
          />
        </div>

        
        <div style={{ marginBottom: '15px', position: 'relative', zIndex: 2 }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input 
            id="email"
            type="email" 
            value={email} 
            onChange={handleEmailChange}
            onClick={handleInputClick}
            required 
            autoComplete="off"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              fontSize: '14px',
              boxSizing: 'border-box',
              position: 'relative',
              zIndex: 3
            }}
          />
          {emailError && <p style={{ color: 'red' }}>{emailError}</p>}
        </div>

      
        <div style={{ marginBottom: '15px', position: 'relative', zIndex: 2 }}>
          <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px' }}>Phone Number:</label>
          <input 
            id="phone"
            type="tel" 
            value={phone} 
            onChange={handlePhoneChange}
            onClick={handleInputClick}
            required 
            autoComplete="off"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              fontSize: '14px',
              boxSizing: 'border-box',
              position: 'relative',
              zIndex: 3
            }}
          />
        </div>

    
        <div style={{ marginBottom: '15px', position: 'relative', zIndex: 2 }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input 
            id="password"
            type="password" 
            value={password} 
            onChange={handlePasswordChange}
            onClick={handleInputClick}
            required 
            autoComplete="off"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              fontSize: '14px',
              boxSizing: 'border-box',
              position: 'relative',
              zIndex: 3
            }}
          />
        </div>

     
        <button 
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 2
          }}
        >
          Register
        </button>
      </form>

     
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Already have an account? <Link to="/" style={{ color: '#007bff' }}>Sign In</Link>
      </p>
    </div>
  );
};

export default Register;