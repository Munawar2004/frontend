import { useState, useEffect } from "react";

const useCart = () => {
    const [cart, setCart] = useState(() => {
        const storedCart = localStorage.getItem("cart");
        return storedCart ? JSON.parse(storedCart) : [];
    });

    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }, [cart]);
    const removeFromCart = (itemId, variantId = null) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(
                (item) => item.id === itemId && item.variantId === variantId
            );

            if (existingItem?.quantity === 1) {
                return prevCart.filter(
                    (item) =>
                        !(item.id === itemId && item.variantId === variantId)
                );
            }

            return prevCart.map((item) =>
                item.id === itemId && item.variantId === variantId
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            );
        });
    };
    const addToCart = (item, variant = null) => {
        console.log("itemmmmmmmmmmmmmmmmmmm", item, variant);
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex(
                (cartItem) =>
                    cartItem.id === item.id &&
                    cartItem.variantId === (variant?.id || null)
            );

            if (existingItemIndex >= 0) {
                const updatedCart = [...prevCart];
                updatedCart[existingItemIndex] = {
                    ...updatedCart[existingItemIndex],
                    quantity: updatedCart[existingItemIndex].quantity + 1,
                };
                return updatedCart;
            }

            return [
                ...prevCart,
                {
                    ...item,
                    variantId: variant?.id || null,
                    variantName: variant?.size || null,
                    price: variant?.price || item.price,
                    quantity: 1,
                    isAvaialable: variant?.isAvaialable,
                },
            ];
        });
    };
    console.log("cart+++++++++++++++++++++++++++=", cart);
    return { cart, setCart, addToCart, removeFromCart };
};

export default useCart;