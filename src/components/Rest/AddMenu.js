import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddMenu.css";
import { useNavigate } from "react-router-dom";
import AddDish from "./AddDish";
import DisplayMenu from "./DisplayMenu";

const AddMenu = () => {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState({});
  const [restaurantId, setRestaurantId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // To prevent memory leaks

    const getRestaurantId = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          if (isMounted) {
            setError("Please log in to access this page.");
            setLoading(false);
          }
          return;
        }

        const userResponse = await axios.get(
          "http://localhost:5191/api/users/profile",
          { 
            headers: { 
              Authorization: `Bearer ${token}`
            } 
          }
        );

        if (!isMounted) return;

        if (userResponse.data.data.user.role !== "Owner") {
          setError("You must be a restaurant owner to access this page.");
          setLoading(false);
          return;
        }

        if (!userResponse.data.data.restaurant_id) {
          setError("No restaurant found for this user. Please register your restaurant first.");
          setLoading(false);
          return;
        }

        const restaurantId = userResponse.data.data.restaurant_id;
        setRestaurantId(restaurantId);
        await fetchMenu(restaurantId);
      } catch (err) {
        if (!isMounted) return;
        
        console.error("Error getting restaurant ID:", err);
        const errorMessage = err.response?.data?.message || 
                           (err.response?.status === 401 ? "Please log in again to access this page." : 
                           (err.response?.status === 404 ? "No restaurant found for this user. Please register your restaurant first." : 
                           "Failed to get restaurant information."));
        setError(errorMessage);
        setLoading(false);
      }
    };

    getRestaurantId();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, []);

  const fetchMenu = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to access this page.");
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `http://localhost:5191/api/menu/${id}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (!res.data?.data) {
        throw new Error("No menu data received");
      }

      const menuItems = res.data.data;
      if (!Array.isArray(menuItems)) {
        throw new Error("Invalid menu data format");
      }

      const categorizedMenu = {};
      menuItems.forEach((categoryData) => {
        const categoryName = categoryData.categoryName || "Uncategorized";
        if (!categorizedMenu[categoryName]) {
          categorizedMenu[categoryName] = [];
        }

        if (categoryData.items && Array.isArray(categoryData.items)) {
          categoryData.items.forEach((item) => {
            categorizedMenu[categoryName].push({
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              imageUrl: item.imageUrl,
              isCustomizable: item.isCustomizable,
              variants: item.variants || [],
              isAvailable: item.isAvailable !== false // Default to true if not specified
            });
          });
        }
      });

      setDishes(categorizedMenu);
      setError("");
    } catch (err) {
      console.error("Error fetching menu:", err);
      setError(err.response?.data?.message || 
              (err.message === "No menu data received" ? "The restaurant menu is empty" : 
              "Failed to load menu items"));
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000); // Auto-hide after 3 seconds
    if (restaurantId) {
      fetchMenu(restaurantId); // Refresh the menu
    }
  };

  return (
    <div className="add-menu">
      
      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError("")} className="close-btn">×</button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess("")} className="close-btn">×</button>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading menu...</div>
      ) : (
        <>
          <AddDish 
            restaurantId={restaurantId} 
            fetchMenu={fetchMenu} 
            onSuccess={handleSuccess}
            onError={setError}
          />
          
          <DisplayMenu 
            dishes={dishes} 
            restaurantId={restaurantId} 
            fetchMenu={fetchMenu} 
            onSuccess={handleSuccess}
            onError={setError}
          />
        </>
      )}
    </div>
  );
};

export default AddMenu;