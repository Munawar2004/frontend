import React, { useEffect, useState, useRef } from "react";
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
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get("http://localhost:5191/api/restaurants");
        const categoriesResponse = await axios.get("http://localhost:5191/api/categories");
        
        const verifiedRestaurants = response.data.data.filter(restaurant => restaurant.isVerified);
        setRestaurants(verifiedRestaurants);
        setCategories(categoriesResponse.data.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
        setCategoryLoading(false);
      }
    };
  
    fetchRestaurants();
    
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleViewMenu = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  const handleSearchChange = async (query) => {
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  
    if (!query) {
      setSearchResults({ restaurants: [], dishes: [] });
      return;
    }
  
    try {
      setIsSearching(true);
      const response = await axios.get(`http://localhost:5191/api/search?query=${query}`);
      
      console.log("Full API response:", response);
      console.log("Response data structure:", response.data);
      
      // Extract data from the nested structure
      const apiData = response.data.data || {};
      
      console.log("Nested restaurants data:", apiData.restaurants);
      console.log("Nested dishes data:", apiData.dishes);
  
      setSearchResults({
        restaurants: Array.isArray(apiData.restaurants) ? apiData.restaurants : [],
        dishes: Array.isArray(apiData.dishes) ? apiData.dishes : []
      });
  
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults({ restaurants: [], dishes: [] });
    } finally {
      setIsSearching(false);
    }
  };
  


  const handleCategoryClick = async (categoryid) => {
    try {
      const response = await axios.get(`http://localhost:5191/api/restaurants/category/${categoryid}`);
      navigate(`/category/${categoryid}`, { state: { categoryData: response.data.data } });
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSearchResults(true);
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
            Within a few clicks, find meals that<br/> are accessible near
            you"
          </h1>
          <div className="search-container" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="hero-search">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search for restaurants or dishes..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSearchResults(true)}
                />
                <button type="submit">
                  <i className="fas fa-search"></i> Search
                </button>
              </div>
            </form>
                       
            {showSearchResults && searchQuery && (
            <div className="search-results-dropdown">
                {isSearching ? (
                <div className="search-loading">
                    <i className="fas fa-spinner fa-spin"></i> Searching...
                </div>
                ) : (
                <>
                    {/* Dishes Section - Now appears first */}
                    {searchResults.dishes.length > 0 && (
  <div className="search-category">
    <h4>DISHES</h4>
    {searchResults.dishes.map((dish) => (
      <div
        key={dish.id || dish.dishId}  
        className="search-item"
        onClick={() => {
            navigate(`/restaurant/${dish.restaurantId}?query=${dish.categoryName}`, {
              state: { 
                selectedCategory: dish.categoryName, // Pass dish's category
                highlightCategory: true
              }
            });
            setShowSearchResults(false);
          }}
      >
        <div className="search-item-image">
          <img
            src={
            `http://localhost:5191/uploads/${dish.imageUrl}`
            }
            alt={dish.imageUrl || dish.name}  
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/50?text=D";
            }}
          />
        </div>
        <div className="search-item-info">
          <h5>{dish.dishName || dish.name}</h5>
          <p>
            {dish.restaurantName || "Dishes"}
          </p>
        
         </div>
        </div>
        ))}
    </div>
    )}

                  
                    {searchResults.restaurants.length > 0 && (
                    <div className="search-category">
                        <h4>RESTAURANTS</h4>
                        {searchResults.restaurants.map((restaurant) => (
                        <div
                            key={restaurant.id}
                            className="search-item"
                            onClick={() => {
                            handleViewMenu(restaurant.id);
                            setShowSearchResults(false);
                            }}
                        >
                            <div className="search-item-image">
                            <img
                                src={
                                restaurant.imageUrl
                                    ? `http://localhost:5191/uploads/${restaurant.imageUrl}`
                                    : "https://via.placeholder.com/50?text=R"
                                }
                                alt={restaurant.restaurantName}
                                onError={(e) => {
                                e.target.src = "https://via.placeholder.com/50?text=R";
                                }}
                            />
                            </div>
                            <div className="search-item-info">
                            <h5>{restaurant.restaurantName}</h5>
                            <p>{ "Restaurant"}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                    )}

                    {/* No results and view all sections remain the same */}
                    {searchResults.restaurants.length === 0 && 
                    searchResults.dishes.length === 0 && (
                    <div className="no-results">
                        No results found for "{searchQuery}"
                    </div>
                    )}

                    {(searchResults.restaurants.length > 0 || 
                    searchResults.dishes.length > 0) && (
                    <div 
                        className="view-all-results"
                        onClick={() => {
                        setShowSearchResults(false);
                        }}
                    >
                        View all results for "{searchQuery}"
                    </div>
                    )}
                </>
                )}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Rest of your components (categories, restaurants) */}
      {(
      <div className="categories-section">
        {categoryLoading ? (
          <p>Loading categories...</p>
        ) : (
          <div className="categories-container">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="category-cards"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <div className="category-image">
                    <img
                      src={
                        category.photo
                          ? `http://localhost:5191/uploads/${category.photo}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                category.name
                            )}&background=random&rounded=true`
                      }
                      alt={category.name}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            category.name
                        )}&background=random&rounded=true`;
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
      )}
      { (
        <div className="restaurants-container">
          {restaurants.length === 0 ? (
            <p>No restaurants available</p>
          ) : (
            restaurants.map((restaurant) => (
              <div 
                key={restaurant.id} 
                className="restaurant-card"
                onClick={() => handleViewMenu(restaurant.id)}
              >
                <div className="restaurant-image">
                  <img
                    src={
                      restaurant.imageUrl
                        ? `http://localhost:5191/uploads/${restaurant.imageUrl}`
                        : "https://via.placeholder.com/300x200?text=Restaurant+Image"
                    }
                    alt={restaurant.restaurantName}
                    onError={(e) => {
                      if (
                        e.target.src !==
                        "https://via.placeholder.com/300x200?text=Restaurant+Image"
                      ) {
                        e.target.src =
                          "https://via.placeholder.com/300x200?text=Restaurant+Image";
                      }
                    }}
                  />
                </div>
                <div className="restaurant-info">
                  <h3>{restaurant.restaurantName}</h3>
                  <p className="food-type">
                    {restaurant.description ||
                      "Description Not Available"}
                  </p>
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