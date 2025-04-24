import React, { useState } from "react";
import { FiHome, FiCoffee, FiUsers, FiGrid, FiPercent } from "react-icons/fi";
import PendingRestaurants from "./PendingRestaurants";
import VerifiedRestaurants from "./VerifiedRestaurants";
import UsersPage from "./UsersPage";
import CategoryPage from "./CategoryPage";
import DiscountsPage from "./Discountspage";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
              <FiHome className="nav-icon" />
              <span>Dashboard</span>
            </li>
            <li className={activeTab === "restaurants" ? "active" : ""} onClick={() => setActiveTab("restaurants")}>
              <FiCoffee className="nav-icon" />
              <span>Restaurants</span>
            </li>
            <li className={activeTab === "categories" ? "active" : ""} onClick={() => setActiveTab("categories")}>
              <FiGrid className="nav-icon" />
              <span>Categories</span>
            </li>
            <li className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
              <FiUsers className="nav-icon" />
              <span>Users</span>
            </li>
            <li className={activeTab === "discounts" ? "active" : ""} onClick={() => setActiveTab("discounts")}>
              <FiPercent className="nav-icon" />
              <span>Discounts</span>
            </li>
          </ul>
        </nav>
      </div>
      <div className="admin-main">
        {activeTab === "dashboard" && <PendingRestaurants />}
        {activeTab === "restaurants" && <VerifiedRestaurants />}
        {activeTab === "categories" && <CategoryPage />}
        {activeTab === "users" && <UsersPage />}
        {activeTab === "discounts" && <DiscountsPage />}
      </div>
    </div>
  );
};

export default AdminPanel;