import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import "./CategoryPage.css";

function CategoryRestaurantsPage() {
  const { categoryid:id } = useParams();
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); 
  const navigate = useNavigate();
console.log("id",id);
  useEffect(() => {
    const fetchRestaurantsByCategory = async () => {
      try {
        const response = await axios.get(`http://localhost:5191/api/restaurants/category/${id}`);
        setRestaurants(response.data.data);
      } catch (error) {
        console.error("Error fetching restaurants by category:", error);
      }
    };

    fetchRestaurantsByCategory();
  }, [id]);

  const handleViewMenu = (restaurantid) => {
    console.log("View Menu clicked for restaurant ID:", restaurantid);
    console.log("Restaurant data:", restaurants.find(r => r.id === restaurantid));
    navigate(`/restaurant/${restaurantid}`);
  };

  return (
    <div className="page-container">
      {!searchQuery && (
        <div className="restaurants-container">
          {restaurants.length === 0 ? (
            <p>No restaurants available</p>
          ) : (
            restaurants.map((restaurant) => (
              <div key={restaurant.id} className="restaurant-card">
                <div className="restaurant-image">
                  <img
                    src={
                      restaurant.imageUrl
                        ? `http://localhost:5191/uploads/${restaurant.imageUrl}`
                        : 'https://via.placeholder.com/300x200?text=Restaurant+Image'
                    }
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
          )}
        </div>
      )}
    </div>
  );
}

export default CategoryRestaurantsPage;
