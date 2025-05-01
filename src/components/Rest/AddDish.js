import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddMenu.css";

const AddDish = ({ restaurantId, fetchMenu }) => {
  const [dishName, setDishName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  const handleAddDish = async (e) => {
    e.preventDefault();

    if (!restaurantId) {
      setError("Restaurant ID not found. Please try logging in again.");
      return;
    }

    if (!image || !(image instanceof File)) {
      setError("Please select a valid image file!");
      return;
    }

    if (!dishName || !description || !category) {
      setError("Please fill all required fields!");
      return;
    }

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
    
    formData.append("RestaurantId", restaurantId);
    formData.append("Name", dishName.trim());
    formData.append("Description", description.trim());
    formData.append("Category", category);
    formData.append("Photo", image);
    formData.append("IsCustomizable", customizable);
    
    if (!customizable) {
      formData.append("Price", parseFloat(price));
    }
    
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
        
        setDishName("");
        setDescription("");
        setPrice("");
        setImage(null);
        setCategory("");
        setCustomizable(false);
        setVariants([]);
        
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
      
    }
  };

  const removeVariant = (index) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file!");
        e.target.value = '';
        return;
      }
      setImage(file);
      setError("");
    }
  };

  return (
    <div className="add-dish">
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
                    onChange={(e) => {
                      setCustomizable(e.target.checked);
                      if (e.target.checked) {
                        setShowVariantPopup(true); 
                      } else {
                        setVariants([]);
                      }
                    }}
                  />
                  Customizable
                </label>
                <div className="form-group button-container">
              <button onClick={handleAddDish} className="add-button">Add Dish</button>
            </div>
              </div>


            {customizable && (
              <div className="variants-section">
               
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
            
          </div>
        </div>
      </div>

      {showVariantPopup && (
        <div className="popup">
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

export default AddDish;