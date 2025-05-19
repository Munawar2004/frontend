import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlusCircle,
  FiShoppingCart,
  FiClock,
  FiLogOut,
  FiHome,
} from "react-icons/fi";
import AddMenu from "./AddMenu";
import Orders from "./Orders";
import OrderHistory from "./OrderHistory";
import OrderRequests from "./OrderRequests";
import DashboardSummary from "./DashboardSummary";
import "./RestaurantDashboard.css";

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboardSummary");
  const [isOpen, setIsOpen] = useState(true); // restaurant open/closed state
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleToggleOpen = async () => {
    const newStatus = !isOpen;
    setIsOpen(newStatus);

    try {
      const response = await fetch("http://localhost:5191/api/restaurants/toggle-orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ isOpen: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      console.log("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="restaurant-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Restaurant Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li
              className={activeTab === "dashboardSummary" ? "active" : ""}
              onClick={() => setActiveTab("dashboardSummary")}
            >
              <FiHome className="nav-icon" />
              <span>Dashboard</span>
            </li>
            <li
              className={activeTab === "addMenu" ? "active" : ""}
              onClick={() => setActiveTab("addMenu")}
            >
              <FiPlusCircle className="nav-icon" />
              <span>Add Menu</span>
            </li>
            <li
              className={activeTab === "orderRequests" ? "active" : ""}
              onClick={() => setActiveTab("orderRequests")}
            >
              <FiClock className="nav-icon" />
              <span>Order Requests</span>
            </li>
            <li
              className={activeTab === "orders" ? "active" : ""}
              onClick={() => setActiveTab("orders")}
            >
              <FiShoppingCart className="nav-icon" />
              <span>Orders</span>
            </li>
            <li
              className={activeTab === "orderHistory" ? "active" : ""}
              onClick={() => setActiveTab("orderHistory")}
            >
              <FiClock className="nav-icon" />
              <span>Order History</span>
            </li>
            {/* After Order History menu item */}
<li className="toggle-item">
  <div className="toggle-container" onClick={handleToggleOpen}>
    <span className="toggle-label">{isOpen ? "Open" : "Closed"}</span>
    <label className="switch">
      <input
        type="checkbox"
        checked={isOpen}
        onChange={handleToggleOpen}
        onClick={e => e.stopPropagation()} // prevent li click bubbling
      />
      <span className="slider" />
    </label>
  </div>
</li>
          </ul>
        </nav>



        {/* Logout Button */}
        <div className="logout-section">
          <div className="logout-box" onClick={handleLogout}>
            <FiLogOut className="logout-icon" />
            <span>Logout</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === "dashboardSummary" && <DashboardSummary />}
        {activeTab === "addMenu" && <AddMenu />}
        {activeTab === "orderRequests" && <OrderRequests />}
        {activeTab === "orders" && <Orders />}
        {activeTab === "orderHistory" && <OrderHistory />}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
