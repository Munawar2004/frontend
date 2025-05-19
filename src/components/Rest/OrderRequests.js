import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrdersRequests.css";

const Orders = () => {
    const [orderlist, setOrderlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [popupLoading, setPopupLoading] = useState(false);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("No authentication token found. Please log in.");
                setLoading(false);
                return;
            }

            const response = await axios.get(
                "http://localhost:5191/api/orders",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.data || !Array.isArray(response.data.data)) {
                setError("Invalid response format from server");
                setLoading(false);
                return;
            }
            const pendingOrders = response.data.data.filter(
                (order) => order.status === "Pending"
            );

            setOrderlist(pendingOrders); 
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };
    useEffect(()=>{
        (async()=>{
            await fetchOrders()
        })()

    },[])

    const fetchOrderDetails = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:5191/api/orders/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setSelectedOrder(response.data.data); 
        } catch (err) {
            console.error("Failed to fetch order details", err);
        }
    };

    const updateOrderStatus =  (orderId, status) => {
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
                Authorization: `Bearer ${token}`, // Directly set headers without nesting under 'headers'
                "Content-Type": "application/json", // Make sure to set the Content-Type for the request body
            },
            body: JSON.stringify(data),
        };

         fetch(url, options)
            .then((response) => response.json())
            .then((result) => {
                alert("Order status updated:", result);
            })
            .catch((error) => {
                console.error("Error updating order status:", error);
                // Handle error, like showing an error message
            });

        setSelectedOrder(null);
    };

    const viewOrderDetails = async (id) => {
        try {
            setPopupLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:5191/api/orders/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setSelectedOrder(response.data); 
        } catch (err) {
            console.error("Failed to fetch order details", err);
        } finally {
            setPopupLoading(false);
        }
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
                                            className="view-btn"
                                            onClick={() =>
                                                fetchOrderDetails(order.id)
                                            }
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">No pending orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {selectedOrder && (
                <div className="modal">
                    <div className="modal-content">
                        {popupLoading ? (
                            <p>Loading order details...</p>
                        ) : (
                            <>
                                <h3>Order Details</h3>

                                <section className="modal-section">
                                    
                                    <h4>User Details</h4>
                                    <p>
                                        <strong>Name:</strong>{" "}
                                        {selectedOrder.user?.name || "N/A"}
                                    </p>
                                    <p>
                                        <strong>Phone.no:</strong>{" "}
                                        {selectedOrder.user?.phone || "N/A"}
                                    </p>
                                </section>

                                <section className="modal-section">
                                    <h4>Address</h4>
                                    <p>
                                        <strong>Area:</strong>{" "}
                                        {selectedOrder.address?.area || "N/A"}
                                    </p>
                                    <p>
                                        <strong>City:</strong>{" "}
                                        {selectedOrder.address?.city || "N/A"}
                                    </p>
                                    <p>
                                        <strong>Landmark:</strong>{" "}
                                        {selectedOrder.address?.landmark ||
                                            "N/A"}
                                    </p>
                                </section>

                                <section className="modal-section">
                                    <h4>Items</h4>
                                    <ul className="modal-items-list">
                                        {selectedOrder.orderItems?.map(
                                            (item, index) => (
                                                <li
                                                    key={index}
                                                    className="modal-item"
                                                >
                                                    {item.menuItemImage && (
                                                        <img
                                                            src={`http://localhost:5191/uploads/${item.menuItemImage}`}
                                                            alt={
                                                                item.menuItemName
                                                            }
                                                        />
                                                    )}
                                                    <p>
                                                        <strong>
                                                            {item.menuItemName}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        <strong>
                                                            Variant:
                                                        </strong>{" "}
                                                        {item.variantName ||
                                                            "Default"}
                                                    </p>
                                                    <p>
                                                        <strong>
                                                            Quantity:
                                                        </strong>{" "}
                                                        {item.quantity}
                                                    </p>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </section>

                                <div className="modal-actions">
                                    {selectedOrder.status === "Pending" && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    updateOrderStatus(
                                                        selectedOrder.id,
                                                        "Accepted"
                                                    )
                                                }
                                                className="accept-btn"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() =>
                                                    updateOrderStatus(
                                                        selectedOrder.id,
                                                        "Declined"
                                                    )
                                                }
                                                className="decline-btn"
                                            >
                                                Decline
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="closee-btn"
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
