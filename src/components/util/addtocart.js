import { useState, useEffect } from "react";

const useCart = () => {
  const [cart, setCart] = useState(() => {
    // Load cart from localStorage if available
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  useEffect(() => {
    // Update localStorage whenever cart state changes
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (item, variant = null) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        cartItem =>
          cartItem.id === item.id &&
          cartItem.variantId === (variant?._id || null)
      );

      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1
        };
        return updatedCart;
      }

      return [
        ...prevCart,
        {
          ...item,
          variantId: variant?._id || null,
          variantName: variant?.name || null,
          price: variant?.price || item.price,
          quantity: 1,
          isCustomizable: item.isCustomizable
        }
      ];
    });
  };

  return { cart, setCart, addToCart };
};

export default useCart;