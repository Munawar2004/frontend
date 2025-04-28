import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FiCoffee, FiTrash2, FiEye } from "react-icons/fi";
import "./AdminPanel.css";
import "./VerifiedRestaurants.css";

const VerifiedRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false); 

  const fetchVerifiedRestaurants = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "http://localhost:5191/api/restaurants",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("API Response:", response.data); 

      if (!response.data || !response.data.success || !response.data.data) {
        throw new Error('Invalid response format from server');
      }

      const transformedRestaurants = response.data.data.map(restaurant => ({
        ...restaurant,
        id: restaurant.id,
        restaurantImage: restaurant.imageUrl 
          ? `http://localhost:5191/uploads/${restaurant.imageUrl}`
          : "http://localhost:3000/default-restaurant.png"
      }));

      setRestaurants(transformedRestaurants);
      setError(null);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError(err.response?.data?.message || "Failed to fetch verified restaurants");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerifiedRestaurants();
  }, [fetchVerifiedRestaurants]);

  const handleDelete = async (restaurantId) => {
    if (!window.confirm("Are you sure you want to delete this restaurant?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      console.log("Deleting restaurant with ID:", restaurantId);
      const response = await axios.delete(`http://localhost:5191/api/restaurants/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Delete response:", response.data);

      if (response.data && response.data.success) {
        setRestaurants((prevRestaurants) => prevRestaurants.filter((r) => r.id !== restaurantId));
        setError(null);
      } else {
        throw new Error(response.data?.message || "Failed to delete restaurant");
      }
    } catch (err) {
      console.error("Error deleting restaurant:", err);
      setError(err.response?.data?.message || "Failed to delete restaurant");
    }
  };

  const handleView = async (restaurant) => {
    try {
      setIsModalOpen(true);
      setModalLoading(true); 

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        setModalLoading(false);
        return;
      }

      const response = await axios.get(
        `http://localhost:5191/api/restaurants/${restaurant.id}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Single Restaurant Fetch:", response.data.data);

      if (!response.data || !response.data.success || !response.data.data) {
        throw new Error("Invalid restaurant detail response");
      }

      const fetchedRestaurant = {
        ...response.data.data,
        restaurantImage: response.data.data.imageUrl
          ? `http://localhost:5191/uploads/${response.data.data.imageUrl}`
          : "http://localhost:3000/default-restaurant.png"
      };

      console.log(fetchedRestaurant)
      setSelectedRestaurant(fetchedRestaurant);
      setError(null);
    } catch (err) {
      console.error("Error fetching restaurant details:", err);
      setError(err.response?.data?.message || "Failed to fetch restaurant details");
    } finally {
      setModalLoading(false); 
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRestaurant(null);
  };

  return (
    <div>
      <h2 className="page-title">Verified Restaurants</h2>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-spinner"></div>
      ) : restaurants.length === 0 ? (
        <div className="empty-state">
          <FiCoffee size={48} />
          <p>No verified restaurants found</p>
        </div>
      ) : (
        <div className="card-grid">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="restaurant-card">
              <div className="card-header">
                <h3>{restaurant.restaurantName}</h3>
                <span className="status-badge verified">Verified</span>
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
                  <span className="info-label">Type:</span>
                  <span>{restaurant?.description || "N/A"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Contact:</span>
                  <span>{restaurant?.restaurantPhone || "N/A"}</span>
                </div>
              </div>
              <div className="card-footer">
                <button className="btn view" onClick={() => handleView(restaurant)}>
                  <FiEye size={18} /> View
                </button>
                <button className="btn delete" onClick={() => handleDelete(restaurant.id)}>
                  <FiTrash2 size={18} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modalLoading ? "Loading..." : `${selectedRestaurant?.restaurantName} Details`}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {modalLoading ? (
                <div className="loading-spinner"></div>
              ) : selectedRestaurant ? (
                <>
                  <div className="modal-section">
                    <h4>Owner Details</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Name:</span>
                        <span>{selectedRestaurant.owner?.name || "N/A"}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Email:</span>
                        <span>{selectedRestaurant.owner?.email || "N/A"}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Phone:</span>
                        <span>{selectedRestaurant.owner?.phone || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-section">
                    <h4>Address Details</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">City:</span>
                        <span>{selectedRestaurant.owner?.address?.city || "N/A"}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Landmark:</span>
                        <span>{selectedRestaurant.owner?.address?.landmark || "N/A"}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Shop No:</span>
                        <span>{selectedRestaurant.owner?.address?.shopNumber || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-section">
                    <h4>Documents</h4>
                    <div className="documents-view">
                      {selectedRestaurant.Document?.length > 0 ? (
                        selectedRestaurant.documents.map((doc, index) => (
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
                        ))
                      ) : (
                        <p>No documents available</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <p>Unable to load restaurant details.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifiedRestaurants;
