import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./RestaurantRegister.css";

function RestaurantRegistration() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [foodType, setFoodType] = useState("");
  const [restaurantPhone, setRestaurantPhone] = useState("");
  const [restaurantImage, setRestaurantImage] = useState(null);
  const [validDocument, setValidDocument] = useState(null);
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [landmark, setLandmark] = useState("");
  const [floor, setFloor] = useState("");
  const [shopNumber, setShopNumber] = useState("");
  const [description, setDescription] = useState("");

  const handleImageChange = (e) => {
    setRestaurantImage(e.target.files[0]);
  };

  const handleDocumentChange = (e) => {
    setValidDocument(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      
      formData.append("ownerName", ownerName);
      formData.append("ownerEmail", ownerEmail);
      formData.append("ownerPassword", password);
      formData.append("ownerPhone", ownerPhone);
      formData.append("restaurantName", restaurantName);
      formData.append("restaurantPhone", restaurantPhone);
      formData.append("description", description);
      formData.append("photo", restaurantImage);
      formData.append("validDocument", validDocument);
      formData.append("area", area);
      formData.append("city", city);
      formData.append("landmark", landmark);
      formData.append("floor", floor);
      formData.append("shopNumber", shopNumber);


      const response = await axios.post("http://localhost:5191/api/restaurants", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.data && response.data.data.restaurant_id) {
        localStorage.setItem("restaurantId", response.data.data.restaurant_id);
        localStorage.setItem("userId", response.data.data.admin_id);
        alert("Restaurant Registered Successfully!");
        navigate("/");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Registration Error:", error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="registration-container">
          <h1 className="registration-title">
              Restaurant Partner Registration
          </h1>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
              {/* Restaurant Details */}
              <div className="form-section">
                  <h2 className="section-title">Restaurant Details</h2>
                  <div className="form-group">
                      <label>Restaurant Name</label>
                      <input
                          type="text"
                          value={restaurantName}
                          onChange={(e) => setRestaurantName(e.target.value)}
                          placeholder="Enter restaurant name"
                          required
                      />
                  </div>

                  <div className="form-group">
                      <label>Food Type</label>
                      <input
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="e.g., Indian, Chinese"
                          required
                      />
                  </div>

                  <div className="form-group">
                      <label>Restaurant Phone Number</label>
                      <input
                          type="tel"
                          value={restaurantPhone}
                          onChange={(e) => setRestaurantPhone(e.target.value)}
                          placeholder="Enter restaurant phone number"
                          required
                      />
                  </div>

                  <div className="form-group">
                      <label>Upload Restaurant Image</label>
                      <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          required
                      />
                  </div>

                  <div className="form-group">
                      <label>
                          Upload Valid Document (License/Registration)
                      </label>
                      <input
                          type="file"
                          accept="image/*"
                          onChange={handleDocumentChange}
                          required
                      />
                      <small className="form-text text-muted">
                          Please upload your restaurant license or registration
                          document (PDF or Word)
                      </small>
                  </div>
              </div>

              <div className="form-section">
                  <h2 className="section-title">Owner Details</h2>
                  <div className="form-group">
                      <label>Owner's Full Name</label>
                      <input
                          type="text"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          placeholder="Enter owner's full name"
                          required
                      />
                  </div>

                  <div className="form-group">
                      <label>Phone Number</label>
                      <input
                          type="tel"
                          value={ownerPhone}
                          onChange={(e) => setOwnerPhone(e.target.value)}
                          placeholder="Enter phone number"
                          required
                      />
                  </div>

                  <div className="form-group">
                      <label>Email</label>
                      <input
                          type="email"
                          value={ownerEmail}
                          onChange={(e) => setOwnerEmail(e.target.value)}
                          placeholder="Enter email address"
                          required
                      />
                  </div>

                  <div className="form-group">
                      <label>Password</label>
                      <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          required
                      />
                  </div>
              </div>

              <div className="form-section">
                  <h2 className="section-title">Restaurant Location</h2>
                  <div className="form-group">
                      <label>Area</label>
                      <input
                          type="text"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          placeholder="Enter area name"
                          required
                      />
                  </div>

                  <div className="form-group">
                      <label>City</label>
                      <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Enter city name"
                          required
                      />
                  </div>

                  <div className="form-group">
                      <label>Landmark</label>
                      <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="Enter nearby landmark"
                          required
                      />
                  </div>

                  <div className="form-group">
                      <label>Floor</label>
                      <input
                          type="text"
                          value={floor}
                          onChange={(e) => setFloor(e.target.value)}
                          placeholder="Enter floor number"
                          required
                      />
                  </div>

                  <div className="form-group">
                      <label>Shop Number</label>
                      <input
                          type="text"
                          value={shopNumber}
                          onChange={(e) => setShopNumber(e.target.value)}
                          placeholder="Enter shop number"
                          required
                      />
                  </div>
              </div>

              <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading}
              >
                  {isLoading
                      ? "Registering..."
                      : "Register as Restaurant Partner"}
              </button>
          </form>
      </div>
  );
}

export default RestaurantRegistration;
