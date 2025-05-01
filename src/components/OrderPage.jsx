import React, { useEffect, useState } from "react";
import "./OrderPage.css";

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem("token");
            const id = localStorage.getItem("userId");

            if (!token) {
                setError("Authentication failed. Please login again.");
                return;
            }

            try {
                const response = await fetch(
                    "http://localhost:5191/api/orders/my-orders",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message || "Failed to fetch orders"
                    );
                }

                const data = await response.json();
                console.log("Fetched orders:", data.data);
                setOrders(data.data);
            } catch (err) {
                console.error("Fetch orders error:", err.message);
                setError(err.message);
            }
        };

        fetchOrders();
        
    }, []);

    return (
        <div className="orders-container">
            <h1 className="orders-title">Your Orders</h1>

            {error && <p className="error-message">{error}</p>}

            {orders.length > 0
                ? orders.map((order) => (
                      <div key={order.id} className="order-card">
                          <div className="order-info">
                              <p>
                                  <span className="order-id">Order ID:</span>{" "}
                                  {order.id}
                              </p>
                              <p>
                                  <span className="order-status">Status:</span>{" "}
                                  {order.status || "Pending"}
                              </p>
                              {order.createdAt && (
                                  <p>
                                      <span className="order-date">
                                          Ordered On:
                                      </span>{" "}
                                      {new Date(
                                          order.createdAt
                                      ).toLocaleDateString()}
                                  </p>
                              )}
                          </div>

                          <div className="items-list">
                              <h2>Items:</h2>
                              {order.orderItems.map((item, index) => (
                                  <div key={index} className="item">
                                      <img
                                          className="item-image"
                                          src={`http://localhost:5191/uploads/${item.menuItemImage}`}
                                          alt={item.menuItemName}
                                      />
                                      <div className="item-info">
                                          <p className="item-name">
                                              {item.menuItemName}
                                          </p>
                                          {item.variantName && (
                                              <p className="item-variant">
                                                  Variant: {item.variantName}
                                              </p>
                                          )}
                                      </div>
                                  </div>
                              ))}
                          </div>

                          <div className="total-price">
                              <p>Total: ₹{order.totalPrice}</p>
                          </div>
                      </div>
                  ))
                : !error && <p className="no-orders">No orders found.</p>}
        </div>
    );
};

export default OrdersPage;
