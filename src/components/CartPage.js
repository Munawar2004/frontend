import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CartPage.css";
import useCart from "./util/addtocart.js";
import Navbar from "./Navbar";

function CartSection() {
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const { cart, setCart, addToCart, removeFromCart } = useCart();
    const [cartitems, setcartitems] = useState([]);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
        setcartitems(cart);
    }, [cart]);

    const cartTotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const handleCheckout = async () => {
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
                addressId: defaultAddress,
                paymentMethod: paymentMethod,
                orderItems: cart.map((item) => ({
                    itemId: item.id,
                    variantId: item.variantId,
                    quantity: item.quantity,
                })),
            };

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
                alert("Order placed successfully!");
            }
        } catch (error) {
            console.error("Error during checkout:", error);
            alert(error.response?.data?.message || "Checkout failed");
        }
    };

    return (
      <div>
          <Navbar />
      <div className="cart-container">
            <div className="cart-header">
                <h2>Your Cart</h2>
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
                                key={`${item.id}-${item.variantId || "base"}`}
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
                                            ₹{item.price} x {item.quantity}q
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
                                                cartAmount: cartTotal,
                                            }
                                        );
                                        if (res.data.success) {
                                            setDiscount(res.data.discountAmount);
                                            alert("Coupon applied!");
                                        } else {
                                            alert(res.data.message || "Invalid coupon");
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
                                    onChange={() => setPaymentMethod("online")}
                                />
                                Online Payment
                            </label>
                        </div>
                        <div className="cart-total">
                            <span>Total Amount</span>
                            <span>₹{cartTotal - discount}</span>
                        </div>
                        <button
                            className="checkout-button"
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </>
            )}
        </div>
        </div>
    );
 
}

export default CartSection;
