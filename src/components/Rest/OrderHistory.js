import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Orders.css";

const OrderHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching order history...");
        const response = await axios.get("http://localhost:5000/api/orders/history", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Raw response data:", response.data);
        
        // Filter orders 
        const filteredOrders = response.data.filter(order => {
          const status = order.status?.toLowerCase() || '';
          console.log("Order status:", status);
          return status === "shipped" || status === "declined";
        });
        
        console.log("Filtered orders:", filteredOrders);
        
        setHistory(filteredOrders);
        setError(null);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.response?.data?.message || "Failed to fetch order history");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  const updateOrderStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory((prevOrders) =>
        prevOrders.map((order) =>
          order._id === id ? { ...order, status } : order
        )
      );
    } catch (err) {
      console.error("Failed to update order status", err);
    }
  };

  return (
    <div className="orders">
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-spinner"></div>
      ) : history.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((order) => (
              <tr key={order._id}>
                <td>{order.customerName}</td>
                <td>{order.phoneNumber || "N/A"}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>{order.items?.map(item => item.name).join(", ")}</td>
                <td>₹{order.total}</td>
                <td>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderHistory;
