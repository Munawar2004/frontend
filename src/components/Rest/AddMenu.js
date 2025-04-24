import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddMenu.css";
import { useNavigate } from "react-router-dom";

const AddMenu = () => {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState({});
  const [dishName, setDishName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [restaurantId, setRestaurantId] = useState(null);
  const [Categories, setCategories] = useState([]);
  const [customizable, setCustomizable] = useState(false);
  const [showVariantPopup, setShowVariantPopup] = useState(false);
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({
    name: '',
    price: ''
  });

  useEffect(() => { 
    const fetchCategories = async () => {
      try {
        const userResponse = await axios.get(
          "http://localhost:5191/api/categories",
        );
        console.log("Categories response:", userResponse.data);
        setCategories(userResponse.data.data);
        if (userResponse.data.data && userResponse.data.data.length > 0) {
          setCategory(userResponse.data.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const getRestaurantId = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to access this page.");
          return;
        }

        console.log("Fetching user profile with token:", token.substring(0, 10) + "..."); // Log token prefix

        // Get user details
        const userResponse = await axios.get(
          "http://localhost:5191/api/users/profile",
          { 
            headers: { 
              Authorization: `Bearer ${token}`
            } 
          }
        );

        console.log("User profile response:", userResponse.data);

        if (userResponse.data.data.user.role !== "Owner") {
          setError("You must be a restaurant owner to access this page.");
          return;
        }

        if (!userResponse.data.data.restaurant_id) {
          setError("No restaurant found for this user. Please register your restaurant first.");
          return;
        }

        const restaurantId = userResponse.data.data.restaurant_id;
        console.log("Found restaurant ID:", restaurantId);
        setRestaurantId(restaurantId);
        fetchMenu(restaurantId);
      } catch (err) {
        console.error("Error getting restaurant ID:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          setError("Please log in again to access this page.");
        } else if (err.response?.status === 404) {
          setError("No restaurant found for this user. Please register your restaurant first.");
        } else {
          setError("Failed to get restaurant information.");
        }
      }
    };

    getRestaurantId();
  }, []);

  const fetchMenu = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to access this page.");
        return;
      }

      console.log("Fetching menu for restaurant ID:", id);

      const res = await axios.get(
        `http://localhost:5191/api/menu/${id}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log("Raw API Response:", res.data);

      
      if (!res.data || !res.data.data) {
        console.error("No data in response:", res.data);
        setError("No data received from server");
        return;
      }

      const menuItems = res.data.data;
      console.log("Menu items from API:", menuItems);

      if (!Array.isArray(menuItems)) {
        console.error("Menu items is not an array:", menuItems);
        setError("Invalid menu data format");
        return;
      }

      if (menuItems.length === 0) {
        console.log("No menu items found");
        setDishes({});
        return;
      }

      const categorizedMenu = {};
      menuItems.forEach((categoryData) => {
        const categoryName = categoryData.categoryName || "Uncategorized";
        if (!categorizedMenu[categoryName]) {
          categorizedMenu[categoryName] = [];
        }

      
        if (categoryData.items && Array.isArray(categoryData.items)) {
          categoryData.items.forEach((item) => {
            const menuItem = {
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              imageUrl: item.imageUrl,
              isCustomizable: item.isCustomizable,
              variants: item.variants || []
            };

            console.log(`Adding item to category ${categoryName}:`, menuItem);
            categorizedMenu[categoryName].push(menuItem);
          });
        }
      });
      
      console.log("Final categorized menu:", categorizedMenu);
      setDishes(categorizedMenu);
    } catch (err) {
      console.error("Error fetching menu:", err);
      if (err.response) {
        console.error("Error response:", err.response.data);
        setError(err.response.data.message || "Failed to fetch menu items");
      } else {
        setError("Failed to connect to server");
      }
    }
  };

  const handleAddDish = async (e) => {
    e.preventDefault();

    if (!restaurantId) {
      setError("Restaurant ID not found. Please try logging in again.");
      return;
    }

    // Check if image is properly set
    if (!image || !(image instanceof File)) {
      setError("Please select a valid image file!");
      return;
    }

    // Validate other required fields
    if (!dishName || !description || !category) {
      setError("Please fill all required fields!");
      return;
    }

    // Validate price or variants based on customizable
    if (!customizable && !price) {
      setError("Please enter a price for the dish!");
      return;
    }

    if (customizable && variants.length === 0) {
      setError("Please add at least one variant for customizable dish!");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    
    // Required fields with proper formatting
    formData.append("RestaurantId", restaurantId);
    formData.append("Name", dishName.trim());
    formData.append("Description", description.trim());
    formData.append("Category", category);
    formData.append("Photo", image);
    formData.append("IsCustomizable", customizable);
    
    if (!customizable) {
      formData.append("Price", parseFloat(price));
    }
    
    // Format variants according to FoodItemVariantRequest model
    const variantsData = customizable && variants.length > 0 
      ? variants.map(variant => ({
          Size: variant.name.trim(),
          Price: parseFloat(variant.price),
          IsAvailable: true
        }))
      : [{
          Size: "Regular",
          Price: parseFloat(price),
          IsAvailable: true
        }];
    
    // Ensure variants is always an array and properly stringified
    const variantsJson = JSON.stringify(variantsData);
    console.log("Variants JSON:", variantsJson);
    
    formData.append("VariantsJson", variantsJson);

    try {
      console.log("Sending form data:", {
        restaurantId,
        name: dishName,
        description,
        category,
        customizable,
        price,
        variants: variantsData,
        variantsJson: variantsJson
      });

      const response = await axios.post(
        "http://localhost:5191/api/menu",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Add dish response:", response.data);

      if (response.data.success) {
        setSuccess("Dish added successfully!");
        setError("");
        
        // Reset form fields
        setDishName("");
        setDescription("");
        setPrice("");
        setImage(null);
        setCategory("");
        setCustomizable(false);
        setVariants([]);
        
        // Refresh the menu
        console.log("Refreshing menu after adding dish...");
        await fetchMenu(restaurantId);
      } else {
        setError(response.data.message || "Failed to add dish");
      }
    } catch (err) {
      console.error("Error adding dish:", err);
      setError(err.response?.data?.message || "Failed to add dish");
    }
  };


  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setNewVariant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addVariant = () => {
    if (newVariant.name && newVariant.price) {
      setVariants(prev => [...prev, newVariant]);
      setNewVariant({ name: '', price: '' });
      setShowVariantPopup(false);
    }
  };

  const removeVariant = (index) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  // Update the image input handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file!");
        e.target.value = ''; // Clear the file input
        return;
      }
      setImage(file);
      setError(""); // Clear any previous error
    }
  };

  return (
    <div className="add-menu">
      <h2>Add Menu Items</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="menu-form">
        <div className="form-card">
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                placeholder="Dish Name"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            {!customizable && (
              <div className="form-group">
                <input
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {Categories.length > 0 ? (
                  Categories.map((c) => (
                    <option key={`category-${c.id}`} value={c.id}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <option value="">Loading categories...</option>
                )}
              </select>
            </div>
            <div className="form-group">
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={customizable}
                  onChange={(e) => setCustomizable(e.target.checked)}
                />
                Customizable
              </label>
            </div>
            {customizable && (
              <div className="variants-section">
                <button 
                  type="button" 
                  className="btn add-variant"
                  onClick={() => setShowVariantPopup(true)}
                >
                  Add Variant
                </button>
                {variants.length > 0 && (
                  <div className="variants-list">
                    {variants.map((variant, index) => (
                      <div key={`variant-${index}`} className="variant-item">
                        <span>{variant.name} - ₹{variant.price}</span>
                        <button 
                          type="button"
                          className="btn remove-variant"
                          onClick={() => removeVariant(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="form-group button-container">
              <button onClick={handleAddDish} className="add-button">Add Dish</button>
            </div>
          </div>
        </div>
      </div>

      <div className="menu-list">
        {Object.entries(dishes).length > 0 ? (
          Object.entries(dishes).map(([category, items]) => {
            console.log(`Rendering category: ${category} with ${items.length} items`);
            return (
              <div key={`category-${category}`} className="category-section">
                <h3>{category}</h3>
                <div className="category-items">
                  {items.map((dish) => {
                    console.log("Rendering dish:", dish);
                    return (
                      <div key={`dish-${dish.id}`} className="menu-item">
                        <div className="item-image">
                          <img 
                            src={dish.imageUrl ? `http://localhost:5191/uploads/${dish.imageUrl}` : '/default-dish.png'} 
                            alt={dish.name}
                            onError={(e) => {
                              console.log("Image loading error for dish:", dish);
                              console.log("Image URL was:", dish.imageUrl);
                              e.target.src = '/default-dish.png';
                              console.log("Set default image for:", dish.name);
                            }}
                          />
                        </div>
                        <div className="item-details">
                          <h4>{dish.name}</h4>
                          <p>{dish.description}</p>
                          <p className="price">₹{dish.price}</p>
                          {dish.isCustomizable && dish.variants && dish.variants.length > 0 && (
                            <div className="variants">
                              <p>Variants:</p>
                              {dish.variants.map((variant, index) => {
                                console.log("Rendering variant:", variant);
                                return (
                                  <div key={`variant-${dish.id}-${index}`} className="variant">
                                    <span>{variant.Size || variant.size} - ₹{variant.Price || variant.price}</span>
                                    {variant.IsAvailable !== undefined && (
                                      <span className="availability">
                                        {variant.IsAvailable ? "Available" : "Not Available"}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-items">No menu items found. Add some dishes to get started!</p>
        )}
      </div>

      {showVariantPopup && (
        <div className="variant-popup">
          <div className="popup-content">
            <h3>Add Variant</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Variant Name"
                name="name"
                value={newVariant.name}
                onChange={handleVariantChange}
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                placeholder="Price"
                name="price"
                value={newVariant.price}
                onChange={handleVariantChange}
              />
            </div>
            <div className="popup-actions">
              <button 
                type="button" 
                className="btn cancel"
                onClick={() => setShowVariantPopup(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn submit"
                onClick={addVariant}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMenu;
