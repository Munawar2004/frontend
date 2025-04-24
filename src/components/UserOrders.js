import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserOrders.css";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:5000/api/orders/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching user orders:", err);
      setError(err.response?.data?.message || "Failed to fetch your orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "Accepted":
        return "status-accepted";
      case "Declined":
        return "status-declined";
      default:
        return "";
    }
  };

  return (
    <div className="user-orders">
      <h2>Your Orders</h2>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-spinner">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <p className="no-orders">You haven't placed any orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <h3>Order #{order._id.slice(-6)}</h3>
                <span className={`status-badge ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-details">
                <p><strong>Restaurant:</strong> {order.restaurantName || "Restaurant"}</p>
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Items:</strong></p>
                <ul className="order-items">
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.name} x {item.quantity} - ₹{item.price * item.quantity}
                    </li>
                  ))}
                </ul>
                <p className="order-total"><strong>Total:</strong> ₹{order.total}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders; 