import { useState, useEffect } from "react";

const Popup = ({
    showCustomizationPopup,
    setShowCustomizationPopup,
    selectedItemId,
    addToCart, // ✅ use this from props
}) => {
    const [variants, setVariants] = useState([]);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [item, setItem] = useState(null);

    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
    };

    const confirmCustomization = () => {
        const obj = {
            categoryId: item.categoryId,
            description: item.description,
            id: item.id,
            imageUrl: item.imageUrl,
            isAvailable: false,
            isCustomizable: false,
            name: item.name,
            price: selectedVariant.price,
            quantity: 1,
            restaurantId: item.restaurantId,
            variantId: null,
            variantName: null,
            variants: null,
        };
        addToCart(obj, selectedVariant);
        setShowCustomizationPopup(false);
    };

    useEffect(() => {
        if (showCustomizationPopup) {
            fetch(`http://localhost:5191/api/menu/item/${selectedItemId}`)
                .then((res) => res.json())
                .then((data) => {
                    setItem(data.data);
                    setVariants(data.data.variants || []);
                })
                .catch((err) =>
                    console.error("Error fetching menu item:", err)
                );
        }
    }, [showCustomizationPopup]);

    if (!showCustomizationPopup) return null;

    return (
        <div className="customization-popup-overlay">
            <div className="customization-popup">
                <h3 className="heading-of-popup">{item?.name}</h3>
                <p>Please select options:</p>

                <div className="variant-options">
                    {variants.map((variant) => (
                        <div
                            key={variant.id}
                            className={`variant-option ${
                                selectedVariant?.id === variant.id
                                    ? "selected"
                                    : ""
                            }`}
                            onClick={() => handleVariantSelect(variant)}
                        >
                            <span>{variant.size}</span>
                            <span>₹{variant.price}</span>
                        </div>
                    ))}
                </div>

                <div className="popup-actions">
                    <button
                        className="cancel-btn"
                        onClick={() => setShowCustomizationPopup(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn"
                        onClick={confirmCustomization}
                        disabled={variants.length > 0 && !selectedVariant}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>x
        </div>
    );
};

export default Popup;