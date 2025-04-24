import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2 } from "react-icons/fi";
import "./UsersPage.css";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async (page) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5191/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('API Response:', response.data); 
      
      if (!response.data || !response.data.success || !response.data.data) {
        throw new Error('Invalid response format from server');
      }

      const usersData = response.data.data;
      setUsers(Array.isArray(usersData) ? usersData : []);
      setTotalPages(1); 
      setCurrentPage(1);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || "Failed to fetch users");
      setUsers([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      console.log("Deleting user with ID:", userId);
      
      const response = await axios.delete(`http://localhost:5191/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Delete response:", response.data);

      if (response.data && response.data.success) {
       
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        setError(null);
      } else {
        throw new Error(response.data?.message || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div>
      <h2 className="page-title">Users List</h2>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <>
          <div className="user-list">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role || "User"}</p>
                <button className="delete-btn" onClick={() => handleDelete(user.id)}>
                  <FiTrash2 size={18} /> Delete
                </button>
              </div>
            ))}
          </div>
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UsersPage;
