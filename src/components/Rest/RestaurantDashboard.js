import React, { useState } from "react";
import { FiPlusCircle, FiShoppingCart, FiClock } from "react-icons/fi";
import AddMenu from "./AddMenu"; 
import Orders from "./Orders"; 
import OrderHistory from "./OrderHistory"; 
import "./RestaurantDashboard.css"; 

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState("addMenu");

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

      {/* Right Content Area */}
      <div className="dashboard-content">
        {activeTab === "addMenu" && <AddMenu />}
        {activeTab === "orders" && <Orders />}
        {activeTab === "orderHistory" && <OrderHistory />}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
