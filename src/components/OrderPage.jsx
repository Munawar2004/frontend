import React, { useEffect, useState } from "react";
import "./OrderPage.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("userId");

      if (!token || !id) {
        setError("Authentication failed. Please login again.");
        return;
      }

      try {
        const response = await fetch("http://localhost:5191/my-orders", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch orders");
        }

        const data = await response.json();
        console.log("Fetched orders:", data.data);
        setOrders([data.data]); 
      } catch (err) {
        console.error("Fetch orders error:", err.message);
        setError(err.message);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {orders.length > 0 ? (
        orders.map((order) => (
          <div
            key={order.id}
            className="border rounded-lg p-6 mb-6 shadow-md hover:shadow-lg transition"
          >
            <div className="mb-4">
              <p className="text-gray-700">
                <span className="font-semibold">Order ID:</span> {order.id}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Status:</span>{" "}
                {order.status || "Pending"}
              </p>
              {order.createdAt && (
                <p className="text-gray-700">
                  <span className="font-semibold">Ordered On:</span>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="border-t pt-4">
              <h2 className="text-xl font-semibold mb-2">Items:</h2>
              {order.orderItems.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center mb-2"
                >
                  <div>
                    <p className="font-medium">{item.menuItemName}</p>
                    {item.variantName && (
                      <p className="text-sm text-gray-500">
                        Variant: {item.variantName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 text-right">
              <p className="text-lg font-bold">
                Total: ₹{order.totalPrice}
              </p>
            </div>
          </div>
        ))
      ) : (
        !error && <p className="text-gray-500">No orders found.</p>
      )}
    </div>
  );
};

export default OrdersPage;
