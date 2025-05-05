// orderService.js
import axios from 'axios';

export const fetchRestaurantDashboardData = async (statsOf) => {
  try {
    const token = localStorage.getItem('Token');  // Or wherever your token is stored

    // Fix the URL by using backticks for string interpolation
    const response = await axios.get(`http://localhost:5191/api/dashboards/restaurant?query=${statsOf}`, {
      headers: {
        Authorization: `Bearer ${token}`,  // Add the token to the Authorization header
      },
    });

    return response.data.data;  // Adjust this if your backend wraps data differently
  } catch (error) {
    console.error('Error fetching restaurant dashboard data:', error);
    throw error;
  }
};
