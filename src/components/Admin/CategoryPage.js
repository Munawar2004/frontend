import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './AdminPanel.css';
import './CategoryPage.css';

const CategoryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [category, setCategory] = useState({
    name: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5191/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategory(response.data.data);
      if (response.data.data.imageUrl) {
        setPreviewImage(`http://localhost:5191/uploads/${response.data.data.imageUrl}`);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch category');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategory(prev => ({
        ...prev,
        imageUrl: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const categoryData = {
        name: category.name
      };

      const url = id 
        ? `http://localhost:5191/api/categories/${id}`
        : 'http://localhost:5191/api/categories';
      
      const method = id ? 'put' : 'post';
      
      const response = await axios[method](url, categoryData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      
      if (response.data && response.data.success) {
        
        alert('Category saved successfully!');
        setTimeout(() => {
          navigate('/admin/categories');
        }, 1000);
      } else {
        setError('Failed to save category');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-form-container">
      <h2>{id ? 'Edit Category' : 'Add New Category'}</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-group">
          <label htmlFor="name">Category Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={category.name}
            onChange={handleChange}
            required
            placeholder="Enter category name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Category Image</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          {previewImage && (
            <div className="image-preview">
              <img src={previewImage} alt="Category preview" />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn cancel" 
            onClick={() => navigate('/admin/categories')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn submit" 
            disabled={loading}
          >
            {loading ? 'Saving...' : (id ? 'Update' : 'Save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryPage; 