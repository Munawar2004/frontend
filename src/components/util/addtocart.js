import { useState, useEffect } from "react";

const useCart = () => {
    const [reloadCart, setReloadCart] = useState(false);
    const [cart, setCart] = useState(() => {
        const storedCart = localStorage.getItem("cart");
        return storedCart ? JSON.parse(storedCart) : [];
    });

    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }, [cart]);
    const token = localStorage.getItem("token");

   const removeFromCart = async (itemId, variantId = null) => {
  setCart((prevCart) => {
    const existingItem = prevCart.find(
      (item) => item.id === itemId && item.variantId === variantId
    );

    if (!existingItem) return prevCart; // nothing to remove

    if (existingItem.quantity === 1) {
      // remove item completely
      return prevCart.filter(
        (item) => !(item.id === itemId && item.variantId === variantId)
      );
    }

    // reduce quantity by 1
    return prevCart.map((item) =>
      item.id === itemId && item.variantId === variantId
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
  });


  try {
    await fetch('http://localhost:5191/api/cart', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        itemId,
        variantId,
        quantity: -1, 
      }),
    });
     setReloadCart(prev => !prev);
  } catch (error) {
    console.error('Error updating cart on backend:', error);
  }
};


    const addToCart = async (id, variantId = null) => {
        console.log("Adding item to cart:", id, variantId);

        let quantityToSend = 1;

        // setCart((prevCart) => {
        //     const existingItemIndex = prevCart.findIndex(
        //         (cartItem) =>
        //             cartItem.id === item.id &&
        //             cartItem.variantId === (variant?.id || null)
        //     );

            // if (existingItemIndex >= 0) {
            //     const updatedCart = [...prevCart];
            //     const updatedQuantity =
            //         updatedCart[existingItemIndex].quantity + 1;
            //     updatedCart[existingItemIndex] = {
            //         ...updatedCart[existingItemIndex],
            //         quantity: updatedQuantity,
            //     };
            //     quantityToSend = updatedQuantity;
            //     return updatedCart;
            // }

        //     return [
        //         ...prevCart,
        //         {
        //             ...item,
        //             variantId: variant?.id || null,
        //             variantName: variant?.size || null,
        //             price: variant?.price || item.price,
        //             quantity: 1,
        //             isAvaialable: variant?.isAvaialable,
        //         },
        //     ];
        // });

        try {
            await fetch('http://localhost:5191/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    itemId: id,
                    variantId: variantId || null,
                    quantity: 1, // or use quantityToSend if needed
                }),
            });
             setReloadCart(prev => !prev);
        } catch (error) {
            console.error("Error adding item to cart:", error);
        }
    };

    return { cart, setCart, addToCart, removeFromCart,reloadCart };
};  // <----- MISSING CLOSING BRACE ADDED HERE

export default useCart;


//     const addToCart = (item, variant = null) => {
//         console.log("itemmmmmmmmmmmmmmmmmmm", item, variant);
//         setCart((prevCart) => {
//             const existingItemIndex = prevCart.findIndex(
//                 (cartItem) =>
//                     cartItem.id === item.id &&
//                     cartItem.variantId === (variant?.id || null)
//             );

//             if (existingItemIndex >= 0) {
//                 const updatedCart = [...prevCart];
//                 updatedCart[existingItemIndex] = {
//                     ...updatedCart[existingItemIndex],
//                     quantity: updatedCart[existingItemIndex].quantity + 1,
//                 };
//                 return updatedCart;
//             }

//             return [
//                 ...prevCart,
//                 {
//                     ...item,
//                     variantId: variant?.id || null,
//                     variantName: variant?.size || null,
//                     price: variant?.price || item.price,
//                     quantity: 1,
//                     isAvaialable: variant?.isAvaialable,
//                 },
//             ];
//         });
//     };
//     console.log("cart+++++++++++++++++++++++++++=", cart);
//     return { cart, setCart, addToCart, removeFromCart };
// };

