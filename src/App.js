
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignIn from './components/Signin';
import Register from './components/Register'; 
import RestaurantRegister from "./components/RestaurantRegister";
import Home from "./components/Home";
import RestaurantMenu from "./components/RestaurantMenu";
import AdminPanel from "./components/Admin/AdminPanel";
import RestaurantDashboard from "./components/Rest/RestaurantDashboard";
import Orders from "./components/Rest/Orders";  
import CategoryPage from "./components/CategoryPage";
import OrdersPage from './components/OrderPage';
import CartPage from "./components/CartPage"


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/Register/user" element={<Register />} />
        <Route path="/Register/restaurant" element={<RestaurantRegister />} />
        <Route path="/home" element={<Home />} />
        <Route path="/restaurant/:id" element={<RestaurantMenu />} /> 
        <Route path="/restaurant/:id/orders" element={<Orders />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/category/:categoryid" element={<CategoryPage />} />
        <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/cart" element={<CartPage />} />

      </Routes>
    </Router>
  );
};

export default App;