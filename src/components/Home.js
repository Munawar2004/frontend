import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Home.css";

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]); 
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ restaurants: [], dishes: [] });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        console.log("Fetching restaurants...");
        const response = await axios.get("http://localhost:5191/api/restaurants");
        console.log("Full API Response:", response);
        console.log("Response Data:", response.data);
        console.log("Restaurants Data:", response.data.data);
  
        const restaurantsData = response.data.data;
        console.log("Number of restaurants:", restaurantsData.length);
        console.log("First Restaurant:", restaurantsData[0]);
  
        // Filter only verified rest
        const verifiedRestaurants = restaurantsData.filter(restaurant => restaurant.isVerified);
        console.log("Number of verified restaurants:", verifiedRestaurants.length);
        console.log("Verified Restaurants:", verifiedRestaurants);
  
        setRestaurants(verifiedRestaurants);
        console.log("Fetching categories...");
        const categoriesResponse = await axios.get("http://localhost:5191/api/categories");
        //  // Replace with your actual API endpoint
        console.log("Categories API Response:", categoriesResponse);
        console.log("Categories Data:", categoriesResponse.data);
        setCategories(categoriesResponse.data.data); 


      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError("Failed to fetch restaurants");
      } finally {
        setLoading(false);
        setCategoryLoading(false);
      }
    };
  
    fetchRestaurants();
  }, []);
  

  const handleViewMenu = (restaurantId) => {
    console.log("View Menu clicked for restaurant ID:", restaurantId);
    console.log("Restaurant data:", restaurants.find(r => r.id === restaurantId));
    navigate(`/restaurant/${restaurantId}`);
  };

  const handleSearchChange = async (query) => {
    setSearchQuery(query);

    if (!query) {
      setSearchResults({ restaurants: [], dishes: [] });
      return;
    }

    try {
      console.log("Searching for:", query);
      const response = await axios.get("http://localhost:5191/api/search");
      console.log("Search API Response:", response.data);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleCategoryClick = async (categoryid) => {
    try {
      console.log("Category clicked:", categoryid);
      const response = await axios.get(`http://localhost:5191/api/restaurants/category/${categoryid}`);
      console.log("Category-specific data:", response.data.data);
      navigate(`/category/${categoryid}`, { state: { categoryData: response.data.data } });
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault(); 
    handleSearchChange(searchQuery); 
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return (
    <div>
      <Navbar />
      <div className="hero-section">
        <div className="overlay">
          <h1>
            "Are you starving? <br />
            Within a few clicks, find meals that are accessible near you"
          </h1>
          <form onSubmit={handleSearchSubmit} className="hero-search">
            <input
              type="text"
              placeholder="Search restaurants or dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </div>

<div className="categories-section">
        
        {categoryLoading ? (
          <p>Loading categories...</p>
        ) : (
          <div className="categories-container">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div key={category.id} className="category-card">
                 <div className="category-image">
                 <img
                      src={
                        category.photo
                          ? `http://localhost:5191/uploads/${category.photo}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&background=random&rounded=true`
                      }
                      alt={category.name}
                      onClick={() => handleCategoryClick(category.id)}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&background=random&rounded=true`;
                      }}
                      style={{ cursor: "pointer" }} 
                    />
                  </div>
                  <h3>{category.name}</h3>
                </div>
              ))
            ) : (
              <p>No categories available</p>
            )}
          </div>
        )}
      </div>
      {searchQuery && (
        <div className="search-results-container">
          <h2>Search Results for "{searchQuery}"</h2>
          <div>
            <h3>Restaurants</h3>
            {searchResults?.restaurants?.length > 0 ? (
              searchResults.restaurants.map((restaurant) => (
                <div key={restaurant.id} className="restaurant-card">
                  <div className="restaurant-image">
                    <img
                      src={restaurant.imageUrl ? `http://localhost:5191/uploads/${restaurant.imageUrl}` : 'https://via.placeholder.com/300x200?text=Restaurant+Image'}
                      alt={restaurant.restaurantName}
                      onError={(e) => {
                        if (e.target.src !== 'https://via.placeholder.com/300x200?text=Restaurant+Image') {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Restaurant+Image';
                        }
                      }}
                    />
                  </div>
                  <div className="restaurant-info">
                    <h3>{restaurant.restaurantName}</h3>
                    <p className="food-type">{restaurant.description || "Description Not Available"}</p>
                    <button
                      className="view-menu-button"
                      onClick={() => handleViewMenu(restaurant.id)}
                    >
                      View Menu
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No restaurants found.</p>
            )}
          </div>
          <div>
            <h3>Dishes</h3>
            {searchResults?.dishes?.length > 0 ? (
              searchResults.dishes.map((dish) => (
                <div key={dish.Id} className="dish-card">
                  <div className="dish-image">
                    <img
                      src={dish.image || "default-dish.png"}
                      alt={dish.dishName}
                      onError={(e) => (e.target.src = "default-dish.png")}
                    />
                  </div>
                  <div className="dish-info">
                    <h4>{dish.dishName}</h4>
                    <p>{dish.description}</p>
                    <p><strong>Price:</strong> ${dish.price}</p>
                    <p><strong>Restaurant:</strong> {dish.restaurantName}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No dishes found.</p>
            )}
          </div>
        </div>
      )}

      {!searchQuery && (
        <div className="restaurants-container">
          {restaurants.length === 0 ? (
            <p>No restaurants available</p>
          ) : (
            restaurants.map((restaurant) => (
              <div key={restaurant.id} className="restaurant-card">
                <div className="restaurant-image">
                  <img
                    src={restaurant.imageUrl ? `http://localhost:5191/uploads/${restaurant.imageUrl}` : 'https://via.placeholder.com/300x200?text=Restaurant+Image'}
                    alt={restaurant.restaurantName}
                    onError={(e) => {
                      if (e.target.src !== 'https://via.placeholder.com/300x200?text=Restaurant+Image') {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Restaurant+Image';
                      }
                    }}
                  />
                </div>
                <div className="restaurant-info">
                  <h3>{restaurant.restaurantName}</h3>
                  <p className="food-type">{restaurant.description || "Description Not Available"}</p>
                  <button
                    className="view-menu-button"
                    onClick={() =>  handleViewMenu(restaurant.id)}
                  >
                    View Menu
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Home;





