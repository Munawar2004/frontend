import React, { useState } from "react";
import axios from "axios";
import "./AddMenu.css";

const DisplayMenu = ({ dishes, restaurantId, fetchMenu, onSuccess, onError }) => {
  const [loadingItems, setLoadingItems] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);

  const handleDelete = async (dishId) => {
    try {
      setLoadingItems(prev => ({ ...prev, [dishId]: true }));
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5191/api/menu/${dishId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        onSuccess("Dish deleted successfully!");
        fetchMenu(restaurantId);
        if (selectedDish && selectedDish.id === dishId) {
          setShowPopup(false);
          setSelectedDish(null);
        }
      } else {
        onError(response.data.message || "Failed to delete dish");
      }
    } catch (err) {
      console.error("Error deleting dish:", err);
      onError(err.response?.data?.message || "Failed to delete dish");
    } finally {
      setLoadingItems(prev => ({ ...prev, [dishId]: false }));
    }
  };

  const toggleAvailability = async (dishId, currentStatus) => {
    try {
      setLoadingItems(prev => ({ ...prev, [dishId]: true }));
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:5191/api/menu/toggle/${dishId}`,
        { isAvailable: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        onSuccess(`Dish marked as ${!currentStatus ? "available" : "unavailable"}!`);
        fetchMenu(restaurantId);
      } else {
        onError(response.data.message || "Failed to update dish availability");
      }
    } catch (err) {
      console.error("Error updating dish availability:", err);
      onError(err.response?.data?.message || "Failed to update dish availability");
    } finally {
      setLoadingItems(prev => ({ ...prev, [dishId]: false }));
    }
  };

  const handleViewDish = async (dishId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5191/api/menu/item/${dishId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (response.data.success) {
        const dish = response.data.data;
  
        if (!dish.variants && dish.Variants) {
          dish.variants = dish.Variants;
        }
  
        setSelectedDish(dish);
        setShowPopup(true);
      } else {
        onError(response.data.message || "Failed to fetch dish details");
      }
    } catch (error) {
      console.error("Error fetching dish:", error);
      onError(error.response?.data?.message || "Failed to fetch dish details");
    }
  };
  

  const closePopup = () => {
    setShowPopup(false);
    setSelectedDish(null);
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch("http://localhost:5191/api/menu/", selectedDish, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
  
      if (response.data.success) {
        onSuccess("Dish updated successfully!");
        fetchMenu(restaurantId);
        setShowPopup(false);
        setSelectedDish(null);
      } else {
        onError(response.data.message || "Failed to update dish");
      }
    } catch (error) {
      console.error("Error updating dish:", error);
      onError(error.response?.data?.message || "Failed to update dish");
    }
  };
  
  const handleSaveSingleVariant = async (index) => {
    try {
      const token = localStorage.getItem("token");
  
      const updatedVariant = selectedDish.variants[index];
      const payload = {
        dishId: selectedDish.id,
        variant: updatedVariant
      };
  
      const response = await axios.patch("http://localhost:5191/api/menu/update-varient", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
  
      if (response.data.success) {
        onSuccess("Variant updated successfully!");
        fetchMenu(restaurantId);
      } else {
        onError(response.data.message || "Failed to update variant");
      }
    } catch (error) {
      console.error("Error updating variant:", error);
      onError(error.response?.data?.message || "Failed to update variant");
    }
  };

  return (
    <div className="menu-list">
      {Object.entries(dishes).length > 0 ? (
        Object.entries(dishes).map(([category, items]) => (
          <div key={`category-${category}`} className="category-section">
            <h3>{category}</h3>
            <div className="category-items">
              {items.map((dish) => (
                <div key={`dish-${dish.id}`} className="menu-item">
                  <div className="item-image">
                    <img
                      src={dish.imageUrl ? `http://localhost:5191/uploads/${dish.imageUrl}` : '/default-dish.png'}
                      alt={dish.name}
                      onError={(e) => { e.target.src = '/default-dish.png'; }}
                    />
                  </div>
                  <div className="item-details">
                    <h4>{dish.name}</h4>
                    <p>{dish.description}</p>
                    <p className="price">₹{dish.price}</p>

                    <div className="item-actions">
                      <button
                        onClick={() => handleViewDish(dish.id)}
                        className="action-btn view-btn"
                      >
                        View
                      </button>

                      <button
                        onClick={() => handleDelete(dish.id)}
                        className="action-btn delete-btn"
                        disabled={loadingItems[dish.id]}
                      >
                        {loadingItems[dish.id] ? "Deleting..." : "Delete"}
                      </button>

                      <button
                        onClick={() => toggleAvailability(dish.id, dish.isAvailable)}
                        className={`action-btn ${dish.isAvailable ? 'available-btn' : 'unavailable-btn'}`}
                        disabled={loadingItems[dish.id]}
                      >
                        {loadingItems[dish.id] ? "Updating..." : dish.isAvailable ? "Available" : "Unavailable"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="no-items">No menu items found.</p>
      )}

      {showPopup && selectedDish && (
        <div className="variant-popup-overlay">
          <div className="variant-popup-content">
            <h2>Edit Dish</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={selectedDish.name || ""}
                  onChange={(e) => setSelectedDish({ ...selectedDish, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={selectedDish.description || ""}
                  onChange={(e) => setSelectedDish({ ...selectedDish, description: e.target.value })}
                />
              </div>
            </div>

            {selectedDish?.variants && selectedDish.variants.length > 0 && (
              <div className="variants-section">
                <h3>Variants</h3>
                {selectedDish.variants.map((variant, index) => (
                  <div key={index} className="variant-row">
                    <div className="variant-field">
                      <label>Size:</label>
                      <input
                        type="text"
                        value={variant.Size || variant.size || ""}
                        onChange={(e) => {
                          const updatedVariants = [...selectedDish.variants];
                          updatedVariants[index].Size = e.target.value;
                          setSelectedDish({ ...selectedDish, variants: updatedVariants });
                        }}
                      />
                    </div>

                    <div className="variant-field">
                      <label>Price:</label>
                      <input
                        type="number"
                        value={variant.Price || variant.price || ""}
                        onChange={(e) => {
                          const updatedVariants = [...selectedDish.variants];
                          updatedVariants[index].Price = parseFloat(e.target.value);
                          setSelectedDish({ ...selectedDish, variants: updatedVariants });
                        }}
                      />
                    </div>

                    <div className="variant-field">
                          <button
                            onClick={() => toggleAvailability(index)}
                            className={`compact-btn ${variant.IsAvailable ? 'available' : 'unavailable'}`}
                            disabled={loadingItems[selectedDish.id]}
                          >
                            {loadingItems[selectedDish.id] ? "Updating..." : variant.IsAvailable ? "Available" : "Unavailable"}
                          </button>
                        </div>

                    <div className="variant-actions">
                      <button
                        className="compact-btn save-btn"
                        onClick={() => handleSaveSingleVariant(index)}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(!selectedDish?.variants || selectedDish.variants.length === 0) && (
              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  value={selectedDish.price || ""}
                  onChange={(e) => setSelectedDish({ ...selectedDish, price: parseFloat(e.target.value) })}
                />
              </div>
            )}

            <div className="button-row">
              <button className="save-btn" onClick={handleSaveChanges}>
                Save Dish
              </button>
              <button className="close-btn" onClick={closePopup}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayMenu;