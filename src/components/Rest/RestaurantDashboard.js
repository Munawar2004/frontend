import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlusCircle, FiShoppingCart, FiClock, FiLogOut } from "react-icons/fi";
import AddMenu from "./AddMenu";
import Orders from "./Orders";
import OrderHistory from "./OrderHistory";
import OrderRequests from "./OrderRequests"; // Import the new component
import "./RestaurantDashboard.css";

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState("addMenu");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="restaurant-dashboard">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Restaurant Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
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
          </ul>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="logout-section">
        <div className="logout-box" onClick={handleLogout}>
          <FiLogOut className="logout-icon" />
          <span>Logout</span>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="dashboard-content">
        {activeTab === "addMenu" && <AddMenu />}
        {activeTab === "orderRequests" && <OrderRequests />} {/* Render Order Requests Component */}
        {activeTab === "orders" && <Orders />}
        {activeTab === "orderHistory" && <OrderHistory />}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
