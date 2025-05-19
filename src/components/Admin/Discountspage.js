import React, { useEffect, useState } from "react";
import "./Discountspage.css";

const DiscountPage = () => {
  const [formData, setFormData] = useState({
    code: "",
    validTill: "",
    type: "Percentage",
    discountValue: "",
    minOrderValue: "",
  });

  const [discounts, setDiscounts] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "discountValue" || name === "minOrderValue" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5191/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create discount");
      }

      const result = await response.json();
      console.log("Discount created successfully:", result);
      alert("Discount created successfully!");

     
      setFormData({
        code: "",
        validTill: "",
        type: "Percentage",
        discountValue: "",
        minOrderValue: "",
      });

      fetchDiscounts(); 
    } catch (error) {
      console.error("Error creating discount:", error.message);
      alert("Something went wrong while creating the discount.");
    }
  };

  const fetchDiscounts = async () => {
    try {
      const response = await fetch("http://localhost:5191/api/coupons");
      if (!response.ok) {
        throw new Error("Failed to fetch discounts");
      }

      const result = await response.json();
      setDiscounts(result.data); 
    } catch (error) {
      console.error("Error fetching discounts:", error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5191/api/coupons/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete discount");
      }

      alert("Discount deleted successfully!");
      fetchDiscounts(); 
    } catch (error) {
      console.error("Error deleting discount:", error.message);
      alert("Something went wrong while deleting the discount.");
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  return (
    <div className="dis">
    <div className="discount-container">
      <h2 className="discount-title">Create Discount</h2>
      <form onSubmit={handleSubmit} className="discount-form">
        <input
          type="text"
          name="code"
          placeholder="Discount Code"
          value={formData.code}
          onChange={handleChange}
          className="form-input"
          required
        />

        <input
          type="date"
          name="validTill"
          value={formData.validTill}
          onChange={handleChange}
          className="form-input"
          required
        />

        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="form-input"
        >
          <option value="Percentage">Percentage</option>
          <option value="Flat">Flat</option>
        </select>

        <input
          type="number"
          name="discountValue"
          placeholder="Discount Value"
          value={formData.discountValue}
          onChange={handleChange}
          step="0.01"
          min="0"
          className="form-input"
          required
        />

        <input
          type="number"
          name="minOrderValue"
          placeholder="Minimum Order Value"
          value={formData.minOrderValue}
          onChange={handleChange}
          min="0"
          className="form-input"
          required
        />

        <button type="submit" className="submit-button">
          Create Discount
        </button>
      </form>
</div>
      <div className="discount-list">
        <h3 className="discount-list-title">Available Discounts</h3>
        {discounts.length > 0 ? (
          <ul>
            {discounts.map((discount) => (
              <li key={discount._id || discount.code} className="discount-item">
                <strong>Code:</strong> {discount.code} |{" "}
                <strong>Type:</strong> {discount.type} |{" "}
                <strong>Discount:</strong> {discount.discountValue} |{" "}
                <strong>Min Order:</strong> {discount.minOrderValue} |{" "}
                <strong>Valid Till:</strong>{" "}
                {new Date(discount.validTill).toLocaleDateString()}
                
                <button
                  onClick={() => handleDelete(discount._id || discount.code)}
                  className="delete-button"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No discounts available.</p>
        )}
      </div>
    </div>
  );
};

export default DiscountPage;
