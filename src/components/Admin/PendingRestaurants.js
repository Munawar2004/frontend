import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FiCheck, FiX, FiCoffee, FiFile, FiEye } from "react-icons/fi";
import "./AdminPanel.css";

const PendingRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPendingRestaurants = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "http://localhost:5191/api/restaurants/requests",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      
      const transformedRestaurants = response.data.data.map(restaurant => ({
        ...restaurant,
        restaurantImage: restaurant.restaurantImage 
          ? `http://localhost:5191/uploads/${restaurant.restaurantImage}`
          : "http://localhost:3000/default-restaurant.png"
      }));

      setRestaurants(transformedRestaurants);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch pending restaurants");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRestaurants();
  }, [fetchPendingRestaurants]);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5191/api/restaurants/varify/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingRestaurants();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve restaurant");
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5191/api/restaurants/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingRestaurants();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject restaurant");
    }
  };

  const handleView = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRestaurant(null);
  };

  return (
    <div>
      <h2 className="page-title">Pending Restaurants</h2>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-spinner"></div>
      ) : restaurants.length === 0 ? (
        <div className="empty-state">
          <FiCoffee size={48} />
          <p>No pending restaurant applications</p>
        </div>
      ) : (
        <div className="card-grid">
          {restaurants.map((restaurant) => (
            <div key={restaurant._id} className="restaurant-card">
              <div className="card-header">
                <h3>{restaurant.restaurantName}</h3>
                <span className="status-badge pending">Pending</span>
              </div>
              <div className="card-body">
                <div className="restaurant-image">
                  <img 
                    src={restaurant.restaurantImage} 
                    alt={restaurant.restaurantName}
                    className="restaurant-preview"
                  />
                </div>
                <div className="info-row">
                  <span className="info-label">Owner:</span>
                  <span>{restaurant.user?.name || "N/A"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Contact:</span>
                  <span>{restaurant.user?.phone || "N/A"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span>{restaurant.user?.email || "N/A"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Location:</span>
                  <span>{restaurant.sector}, {restaurant.locality}</span>
                </div>
              </div>
              <div className="card-footer">
                <button className="btn view" onClick={() => handleView(restaurant)}>
                  <FiEye size={18} /> View
                </button>
                <button className="btn approve" onClick={() => handleApprove(restaurant.id)}>
                  <FiCheck /> Approve
                </button>
                <button className="btn reject" onClick={() => handleReject(restaurant.id)}>
                  <FiX /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && selectedRestaurant && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedRestaurant.restaurantName} Details</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h4>Owner Details</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Name:</span>
                    <span>{selectedRestaurant.user?.name || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span>{selectedRestaurant.user?.email || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone:</span>
                    <span>{selectedRestaurant.user?.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4>Address Details</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Sector:</span>
                    <span>{selectedRestaurant.sector || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Locality:</span>
                    <span>{selectedRestaurant.locality || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Full Address:</span>
                    <span>{selectedRestaurant.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4>Documents</h4>
                <div className="documents-view">
                  {selectedRestaurant.documents?.map((doc, index) => (
                    <div key={index} className="document-item">
                      <a 
                        href={`http://localhost:5191/uploads/${doc}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="document-link"
                      >
                        View Document {index + 1}
                      </a>
                    </div>
                  )) || <p>No documents available</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRestaurants;
