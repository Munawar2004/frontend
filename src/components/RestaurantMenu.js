import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./RestaurantMenu.css";
import Popup from "./Popup.jsx";
import useCart from "./util/addtocart.js";
import { Cashfree } from "./cashfree.js";
import {load} from '@cashfreepayments/cashfree-js';

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
    const { cart, setCart, addToCart, removeFromCart,reloadCart } = useCart();
    const [searchParams] = useSearchParams();
    const categoryName = searchParams.get('query');
    const [sorted,setSorted]=useState([]);
    
     const token = localStorage.getItem("token");
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
    }, [id,reloadCart]);
    
    

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
const cashfreecheckout = async(sessionId)=>{

      let checkoutOptions = {
                            paymentSessionId:sessionId 
                            //  returnUrl:
                            //      "http://localhost:3000/orders",
                        };
      const cashfree= await load({
mode:"sandbox"
});
                      if (cashfree) {
    cashfree.checkout(checkoutOptions).then(function (result) {
        console.log("Checkout Result:", result);

        if (result.error) {
            alert("Error: " + result.error.message);
            return null;
        }

        if (result.redirect) {
            console.log("Redirection:", result.redirect);
        }

        if (
            result &&
            result.transaction &&
            result.transaction.transactionId
        ) {
            const transactionId = result.transaction.transactionId;
            return result;
            console.log("Transaction ID:", transactionId);

            // Use transactionId as needed, e.g.:
            // sendTransactionIdToBackend(transactionId);
        } else {
            console.warn("Transaction ID not found in result.");
        }
                            });
                           
                        } else {
                            console.error("Cashfree SDK is not loaded on window.");
                            alert("Payment system is not ready. Please refresh the page and try again.");
                        }
}
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
                        
                      
                      
                       const result= await cashfreecheckout(paymentResponse.data.paymentSessionId);
                       console.log("______________________________",result)
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
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5191/api/cart", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
       setCart(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  
    fetchCart();
  
}, [isCartOpen,reloadCart]);



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
                   {!restaurant?.isActive && (
          <div className="inactive-overlay">
              </div>
            )}
            
            <div className="background-section"
            
             style={{
                backgroundImage: restaurant
                    ? `url(http://localhost:5191/uploads/${restaurant.imageUrl})`
                    : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
                <div className="details">
  {restaurant && (
    <>
      <h1 className="restaurant-name">{restaurant.restaurantName}</h1>
      <p className="restaurant-description">{restaurant.description}</p>
      <p className="restaurant-phone"> {restaurant.phone}</p>

      <div className="restaurant-address">
        <p>
            {restaurant.owner?.address?.city} | {restaurant.owner?.address?.landmark} | 
         Shop no: {restaurant.owner?.address?.shopNumber} | Floor: {restaurant.owner?.address?.floor}
       
          
        </p>
      </div>
    </>
  )}
</div>

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
  (item) =>
    item.itemId === dish.id &&
    (item.variantId === dish.variantId || (!item.variantId && !dish.variantId))
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
                                                 {restaurant?.isActive && (
  cartItem && !dish.isCustomizable ? (
    <div className="quantity-controls">
      <button onClick={() => removeFromCart(dish.id, dish.variantId)}>
        -
      </button>
      <span>{cartItem.quantity}</span>
      <button onClick={() => addToCart(dish.id, dish.variantId)}>
        +
      </button>
    </div>
  ) : (
    <button
      className="add-button"
      onClick={() => handleAddClick(dish.id,dish.variantId)}
    >
      ADD
    </button>
  )
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
                            {cart.map((item) => (
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
                                        <h3>{item.itemName}</h3>
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
                                                    item.itemId,
                                                    item.variantId
                                                )
                                            }
                                        >
                                            -
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            onClick={() =>
                                                addToCart(item.itemId, 
                                                     item.variantId,
                                                )
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
