import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrdersRequests.css";

const Orders = () => {
    const [orderlist, setOrderlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [popupLoading, setPopupLoading] = useState(false);
const [showFilterDropdown, setShowFilterDropdown] = useState(false);
const [filterType, setFilterType] = useState("range"); // "specific" or "range"
const [ofDate, setOfDate] = useState("");
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [pageNumber, setPageNumber] = useState(1);
const [pageSize] = useState(7);


    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("No authentication token found. Please log in.");
                setLoading(false);
                return;
            }

           const params = {
    pageSize,
    pageNumber,
    ...(filterType === "specific" && ofDate ? { ofDate } : {}),
    ...(filterType === "range" && (fromDate || toDate)
        ? { fromDate: fromDate || undefined, toDate: toDate || undefined }
        : {}),
};

            const response = await axios.get(
                "http://localhost:5191/api/orders/restaurant-order-history",
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params,
                }
            );

            if (!response.data || !response.data.data) {
                setError("Invalid response format from server");
                setLoading(false);
                return;
            }

            const ordersArray = Array.isArray(response.data.data)
                ? response.data.data
                : [response.data.data];

            setOrderlist(ordersArray);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (id) => {
        setPopupLoading(true);
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
        } finally {
            setPopupLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [ofDate, fromDate, toDate, filterType, pageNumber]);

    return (
        <div className="orders">
            <h2>Delivered Orders</h2>

      <div className="filter-container">
    <div className="filter-wrapper">
        <button
            className="filter-button"
            onClick={() => setShowFilterDropdown((prev) => !prev)}
        >
            🔍 Filter
        </button>

        {showFilterDropdown && (
            <div className="filter-dropdown">
                <label>
                    Filter Type:
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="specific">Specific Day</option>
                        <option value="range">Date Range</option>
                    </select>
                </label>

                {filterType === "specific" ? (
                    <label>
                        Date:
                        <input
                            type="date"
                            value={ofDate}
                            onChange={(e) => {
                                setOfDate(e.target.value);
                                setPageNumber(1);
                            }}
                        />
                    </label>
                ) : (
                    <>
                        <label>
                            From:
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => {
                                    setFromDate(e.target.value);
                                    setPageNumber(1);
                                }}
                            />
                        </label>
                        <label>
                            To:
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => {
                                    setToDate(e.target.value);
                                    setPageNumber(1);
                                }}
                            />
                        </label>
                    </>
                )}
            </div>
        )}
    </div>
</div>



            {error && <div className="error-message">{error}</div>}
            {loading ? (
                <p>Loading orders...</p>
            ) : (
                <>
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
                                    <td colSpan="6">No delivered orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="pagination-controls">
                        <button
                            disabled={pageNumber === 1}
                            onClick={() => setPageNumber((prev) => prev - 1)}
                        >
                            Previous
                        </button>
                        <span>Page {pageNumber}</span>
                        <button
                            disabled={orderlist.length < pageSize}
                            onClick={() => setPageNumber((prev) => prev + 1)}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}

            {/* Modal Popup */}
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
                                        {selectedOrder.address?.landmark || "N/A"}
                                    </p>
                                </section>

                                <section className="modal-section">
                                    <h4>Items</h4>
                                    <ul className="modal-items-list">
                                        {selectedOrder.orderItems?.map((item, index) => (
                                            <li key={index} className="modal-item">
                                                {item.menuItemImage && (
                                                    <img
                                                        src={`http://localhost:5191/uploads/${item.menuItemImage}`}
                                                        alt={item.menuItemName}
                                                    />
                                                )}
                                                <p>
                                                    <strong>{item.menuItemName}</strong>
                                                </p>
                                                <p>
                                                    <strong>Variant:</strong>{" "}
                                                    {item.variantName || "Default"}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <div className="modal-actions">
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="close-btn"
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
