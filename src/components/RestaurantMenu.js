import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./RestaurantMenu.css";
import Popup from "./Popup.jsx";
import useCart from "./util/addtocart.js";
import { Cashfree } from "./cashfree.js";

function RestaurantMenu() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredMenu, setFilteredMenu] = useState([]);

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [orderHistory, setOrderHistory] = useState([]);
    const [orderLoading, setOrderLoading] = useState(false);
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [showCustomizationPopup, setShowCustomizationPopup] = useState(false);
    const [selectedCustomizableItem, setSelectedCustomizableItem] =
        useState(true);
    const [selectedItemId, setSelectedItemId] = useState("");
    const [showVariantPopup, setShowVariantPopup] = useState(false);
    const [customizationItemDetails, setCustomizationItemDetails] =
        useState(null);
    const [cartitems, setcartitems] = useState([]);
    const { cart, setCart, addToCart, removeFromCart } = useCart();
    const [searchParams] = useSearchParams();
    const categoryName = searchParams.get('query');
    const [sorted,setSorted]=useState([]);
    
    
    useEffect(() => {
        const fetchRestaurantMenu = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5191/api/menu/${id}`
                );
                console.log("Menu data:", response.data.data);
    
                const restresponse = await axios.get(
                    `http://localhost:5191/api/restaurants/${id}`
                );
                console.log("Restaurant data:", restresponse.data.data);
    
                // Set restaurant if fetched successfully
                if (restresponse.data.success && restresponse.data.data) {
                    setRestaurant(restresponse.data.data);
                }
    
                // Set menu if fetched successfully
                if (response.data.success && Array.isArray(response.data.data)) {
                    setFilteredMenu(response.data.data);
                } else {
                    setError("Invalid menu data received");
                }
            } catch (err) {
                console.error("Error fetching menu or restaurant:", err);
                setError("Failed to fetch restaurant menu");
            } finally {
                setLoading(false);
            }
        };
    
        fetchRestaurantMenu();
    }, [id]);
    
    

    useEffect(() => {
        console.log("zzzzzzzzzz", filteredMenu);
    }, [filteredMenu]);
    useEffect(() => {
            console.log("---",categoryName,     sortitem(filteredMenu,categoryName), restaurant?.menu)
           setSorted(  sortitem(filteredMenu,categoryName))
    }, [searchTerm,categoryName, restaurant,filteredMenu]);
    const sortitem = (items, query) => {
        if (!query) return items;  // ← handle empty query gracefully
        const queryItems = items.filter(item => item.categoryName === query);
        const withoutQueryItems = items.filter(item => item.categoryName !== query);
        return [...queryItems, ...withoutQueryItems];
    };

    useEffect(() => {
        if (selectedCustomizableItem && showCustomizationPopup) {
            const fetchItemDetails = async () => {
                try {
                    const response = await fetch(
                        `/api/menu/${selectedCustomizableItem.id}`
                    );
                    const data = await response.json();
                    setCustomizationItemDetails(data); 
                } catch (error) {
                    console.error("Error fetching menu item:", error);
                }
            };

            fetchItemDetails();
        }
    }, [selectedCustomizableItem, showCustomizationPopup]);
    console.log("cart------", cart);

    const handleAddClick = (item) => {
        if (item.isCustomizable === true) {
            setSelectedItemId(item.id);
            setShowCustomizationPopup(true);
        } else {
            addToCart(item);
        }
    };

    const originalTotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );
    const discountedTotal = originalTotal - discount;

    const cartTotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const handleCheckout = async () => {
        console.log("hello");
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please log in to place an order");
                return;
            }
    
            if (cart.length === 0) {
                alert("Your cart is empty");
                return;
            }
    
            const defaultAddress = localStorage.getItem("defaultAddressId");
            if (!defaultAddress) {
                alert("Please set a default address before checkout");
                return;
            }
    
            const orderData = {
                restaurantId: id,
                addressId: defaultAddress,
                paymentMethod: paymentMethod, // Use the selected payment method
                paymentTransactionId: paymentMethod === "cod" ? "" : null,
                orderItems: cart.map((item) => ({
                    itemId: item.id,
                    variantId: item.variantId,
                    quantity: item.quantity,
                })),
            };
    
            console.log("Order Data Sent:", orderData);
    
            localStorage.setItem("pendingOrder", JSON.stringify(orderData));
    
            if (paymentMethod === "cod") {
                // Handle COD payment
                const response = await axios.post(
                    "http://localhost:5191/api/orders",
                    orderData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
    
                if (response.data) {
                    setCart([]);
                    setIsCartOpen(false);
                    localStorage.removeItem("pendingOrder");
                    alert("Order placed successfully!");
                }
            } else {
                // Handle online payment
                try {
                    // Step 1: Get payment session ID from your API
                    const paymentResponse = await axios.post(
                        "http://localhost:5191/api/payment",
                        {
                            amount: discountedTotal,
                            orderId: `order_${Date.now()}`,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );
                
                    if (paymentResponse.data && paymentResponse.data.paymentSessionId) {
                        console.log("!!!!!!", paymentResponse.data.paymentSessionId);
                        
                        const cashfree = window.Cashfree;
                        console.log("-------",`${window.location.origin}`,cashfree);
                      
                        let checkoutOptions = {
                            paymentSessionId: paymentResponse.data.paymentSessionId ,
                            returnUrl:
                                "https://test.cashfree.com/pgappsdemos/v3success.php?myorder={order_id}",
                        };
                        if (cashfree) {
                            // Initialize checkout
                            cashfree.checkout(checkoutOptions).then(function (result) {
                                if (result.error) {
                                    alert(result.error.message);
                                }
                                if (result.redirect) {
                                    console.log("Redirection");
                                }
                            });
                           
                
                            // Start checkout flow
                            cashfree.pay();
                        } else {
                            console.error("Cashfree SDK is not loaded on window.");
                            alert("Payment system is not ready. Please refresh the page and try again.");
                        }
                    } else {
                        throw new Error("Failed to get payment session ID");
                    }
                } catch (error) {
                    console.error("Error during payment processing:", error);
                    alert(error.response?.data?.message || "Payment processing failed");
                }
                
            }
        } catch (error) {
            console.error("Error during checkout:", error);
            alert(error.response?.data?.message || "Checkout failed");
        }
    };

    const fetchOrderHistory = async () => {
        try {
            setOrderLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(
                "http://localhost:5191/api/my-orders",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setOrderHistory(response.data);
        } catch (err) {
            console.error("Error fetching order history:", err);
        } finally {
            setOrderLoading(false);
        }
    };

    const handleMenuClick = () => {
        setIsMenuOpen(!isMenuOpen);
        if (!isMenuOpen) {
            fetchOrderHistory();
        }
    };

    useEffect(() => {
        console.log("Cart updated and saved to localStorage:", cart);
        localStorage.setItem("cart", JSON.stringify(cart));
        setcartitems(cart);
    }, [cart]);

    useEffect(() => {
        console.log("Cart items updated from hook:", cartitems);
    }, [cartitems]);
    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

   
    const categorizedMenu = {};
    filteredMenu.forEach((category) => {
        if (category.categoryName && category.items) {
            categorizedMenu[category.categoryName] = category.items;
        }
    });

    return (
        <div className="restaurant-menu">
             <div className="background-section"
             style={{
                backgroundImage: restaurant
                    ? `url(http://localhost:5191/uploads/${restaurant.imageUrl})`
                    : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
            <header className="header">
                <div className="header-content">
                    <div className="menu-container">
                        <button
                            className="menu-button"
                            onClick={handleMenuClick}
                        >
                            ☰
                        </button>
                        {isMenuOpen && (
                            <div className="menu-dropdown">
                                <div
                                    className="menu-item"
                                    onClick={() => navigate("/orders")}
                                >
                                    <span>Orders</span>
                                </div>
                                {orderLoading ? (
                                    <div className="menu-item loading">
                                        Loading orders...
                                    </div>
                                ) : orderHistory.length > 0 ? (
                                    <div className="recent-orders">
                                        <div className="menu-item header">
                                            Recent Orders
                                        </div>
                                        {orderHistory
                                            .slice(0, 3)
                                            .map((order) => (
                                                <div
                                                    key={order._id}
                                                    className="menu-item order"
                                                >
                                                    <span>
                                                        Order #
                                                        {order._id.slice(-4)}
                                                    </span>
                                                    <span
                                                        className={`status ${order.status.toLowerCase()}`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="menu-item">
                                        No recent orders
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div
                        className="cart-icon"
                        onClick={() => setIsCartOpen(!isCartOpen)}
                    >
                        🛒
                        {cartitems.length > 0 && (
                            <span className="cart-count">
                                {cartitems.length}
                            </span>
                        )}
                    </div>
                </div>
            </header>
            <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            </div>
     
            <div className="menu-categories">
            {!restaurant?.isActive && (
          <div className="inactive-overlay">
            <p>This restaurant is currently inactive.</p>
              </div>
            )}
           
                {sorted.length>0 && sorted.map((category) => (
                    <div key={category} className="category-section">
                        {showCustomizationPopup && (
                            <Popup
                                showCustomizationPopup={showCustomizationPopup}
                                setShowCustomizationPopup={
                                    setShowCustomizationPopup
                                }
                                selectedItemId={selectedItemId}
                                addToCart={addToCart}
                            />
                        )}
                        <h2 className="category-title">{category.categoryName.toUpperCase()}</h2>
                        <div className="dishes">
                    
                            {category.items.map((dish) => {
                                const cartItem = cart.find(
                                    (item) => item.id === dish.id
                                );
                                return (
                                    <div key={dish.id} className="dish-card">
                                        <div className="dish-content">
                                            <div className="dish-info">
                                                <h3>{dish.name}</h3>
                                                <p className="description">
                                                    {dish.description}
                                                </p>
                                                <div className="price-action">
                                                    <span className="price">
                                                        ₹{dish.price}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="dish-image-container">
                                                <img
                                                    src={`http://localhost:5191/uploads/${dish.imageUrl}`}
                                                    alt={dish.name}
                                                    className="dish-image"
                                                />
                                                {cartItem &&
                                                !dish.isCustomizable ? (
                                                    <div className="quantity-controls">
                                                        <button
                                                            onClick={() =>
                                                                removeFromCart(
                                                                    dish.id,
                                                                    dish.variantId
                                                                )
                                                            }
                                                        >
                                                            -
                                                        </button>
                                                        <span>
                                                            {cartItem.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                addToCart(dish)
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="add-button"
                                                        onClick={() =>
                                                            handleAddClick(dish)
                                                        }
                                                    >
                                                        ADD
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

                                          

            <div className={`cart-sidebar ${isCartOpen ? "open" : ""}`}>
                <div className="cart-header">
                    <h2>Your Cart</h2>
                    <button onClick={() => setIsCartOpen(false)}>×</button>
                </div>
                {cartitems.length === 0 ? (
                    <div className="empty-cart">
                        <p>Your cart is empty</p>
                    </div>
                ) : (
                    <>
                        <div className="cart-items">
                            {cartitems.map((item) => (
                                <div
                                    key={`${item.id}-${
                                        item.variantId || "base"
                                    }`}
                                    className="cart-item"
                                >
                                    <img
                                        src={`http://localhost:5191/uploads/${item.imageUrl}`}
                                        alt={item.name}
                                    />
                                    <div className="cart-item-details">
                                        <h3>{item.name}</h3>
                                        {item.variantName && (
                                            <p className="variant-name">
                                                Variant: {item.variantName}
                                            </p>
                                        )}
                                        <div className="cart-item-actions">
                                            <span className="cart-item-price">
                                                ₹{item.price} 
                                            </span>
                                        </div>
                                    </div>
                                    <div className="cart-quantity-controls">
                                        <button
                                            onClick={() =>
                                                removeFromCart(
                                                    item.id,
                                                    item.variantId
                                                )
                                            }
                                        >
                                            -
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            onClick={() =>
                                                addToCart(item, {
                                                    Id: item.variantId,
                                                })
                                            }
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-footer">
                            <div className="footer-a">
                            <div className="coupon-section">
                                <input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    value={coupon}
                                    onChange={(e) => setCoupon(e.target.value)}
                                />
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await axios.post(
                                                "http://localhost:5191/api/coupons/verify",
                                                {
                                                    code: coupon,
                                                    cartAmount: originalTotal,
                                                }
                                            );
                                            if (res.data.success) {
                                                setDiscount(
                                                    res.data.discountAmount
                                                );
                                                alert("Coupon applied!");
                                            } else {
                                                alert(
                                                    res.data.message ||
                                                        "Invalid coupon"
                                                );
                                            }
                                        } catch (err) {
                                            alert("Error validating coupon");
                                            console.error(err);
                                        }
                                    }}
                                >
                                    Apply
                                </button>
                            </div>
                            <div className="payment-method">
                                <label>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === "cod"}
                                        onChange={() => setPaymentMethod("cod")}
                                    />
                                    Cash on Delivery
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="online"
                                        checked={paymentMethod === "online"}
                                        onChange={() =>
                                            setPaymentMethod("online")
                                        }
                                    />
                                    Online Payment
                                </label>
                            </div>
                            </div>
                            <div className="footer-b">
                            <div className="cart-total">
                                <span>Total Amount</span>
                                <span>₹{cartTotal}</span>
                            </div>
                            <button
                                className="checkout-button"
                                onClick={handleCheckout}
                            >
                                Proceed to Checkout
                            </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default RestaurantMenu;
