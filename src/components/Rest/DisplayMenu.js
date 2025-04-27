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

  const handleViewVariants = (dish) => {
    if (!dish.variants && dish.Variants) {
      dish.variants = dish.Variants; // fallback if API sends different key
    }
    setSelectedDish(dish);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedDish(null);
  };

  const toggleVariantAvailability = (index) => {
    const updatedVariants = [...selectedDish.variants];
    updatedVariants[index].IsAvailable = !updatedVariants[index].IsAvailable;
    setSelectedDish({ ...selectedDish, variants: updatedVariants });
  };

  const deleteVariant = (index) => {
    const updatedVariants = selectedDish.variants.filter((_, i) => i !== index);
    setSelectedDish({ ...selectedDish, variants: updatedVariants });
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
                        onClick={() => handleViewVariants(dish)}
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

      {/* Popup Modal */}
      {showPopup && selectedDish && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>{selectedDish.name}</h2>
            <p>{selectedDish.description}</p>

            {selectedDish.variants && selectedDish.variants.length > 0 ? (
              <div className="variants-section">
                <h3>Variants</h3>
                {selectedDish.variants.map((variant, index) => (
                  <div key={index} className="variant-item">
                    <span>{variant.Size || variant.size} - ₹{variant.Price || variant.price}</span>
                    <button onClick={() => toggleVariantAvailability(index)}>
                      {variant.IsAvailable ? "Available" : "Unavailable"}
                    </button>
                    <button onClick={() => deleteVariant(index)}>Delete</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-variants">
                <h3>Price</h3>
                <p>₹{selectedDish.price}</p>
              </div>
            )}

            <button onClick={closePopup} className="close-btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayMenu;
