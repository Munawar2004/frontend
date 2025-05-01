import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Orders.css";

const Orders = () => {
    const [orderlist, setOrderlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("No authentication token found. Please log in.");
                setLoading(false);
                return;
            }

            const response = await axios.get(
                "http://localhost:5191/api/orders/accepted-orders",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.data || !Array.isArray(response.data.data)) {
                setError("Invalid response format from server");
                setLoading(false);
                return;
            }
            console.log("111111111111111111111", response.data.data);
            setOrderlist(response.data.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = (orderId, status) => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("No authentication token found. Please log in.");
            setLoading(false);
            return;
        }
        const url = `http://localhost:5191/api/orders/${orderId}`;
        const data = { status };

        const options = {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`, 
                "Content-Type": "application/json", 
            },
            body: JSON.stringify(data),
        };
        fetch(url, options)
            .then((response) => response.json())
            .then((result) => {
                console.log("Order status updated:", result);
                fetchOrders(); 
            })
            .catch((error) => {
                console.error("Error updating order status:", error);
            });
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="orders">
            <h2>Orders</h2>
            {error && <div className="error-message">{error}</div>}
            {loading ? (
                <p>Loading orders...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Customer ID</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderlist.length > 0 ? (
                            orderlist.map((order) => (
                                <tr key={order.id}>
                                    <td>{order.userId}</td>
                                    <td>{order?.orderItems?.length || 0}</td>
                                    <td>₹{order.totalPrice}</td>
                                    <td>{order.status}</td>
                                    <td>{order.paymentMethod}</td>
                                    <td>
                                        <button
                                            className="accept-btns"
                                            onClick={() =>
                                                updateOrderStatus(
                                                    order.id,
                                                    "Accepted"
                                                )
                                            }
                                        >
                                            Ready
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">No active orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Orders;
