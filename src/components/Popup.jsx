import { useState,useEffect } from "react";
import useCart from "./util/addtocart";

const Popup = ({ showCustomizationPopup, setShowCustomizationPopup,selectedItemId }) => {
  const [variants, setvariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [item,setItem]=useState (null);
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const { cart,setCart, addToCart } = useCart()
  const confirmCustomization = () => {
     let obj={
      //  price:selectedVariant.price,
      //  variantName:selectedVariant.size,
      //  id:item.id,
      //  name:item.name,
      //  variantId:selectedVariant.id,
      //  variantName:selectedVariant.size,
      //  quantity: 1,
      //  imageUrl:item.imageUrl,
      
categoryId
: 
"01965cc0-7a62-7a3d-b9b6-686c5abf8364",
description
: 
"ded",
id
: 
"06b5cec9-8c1c-4d7b-8ed6-baa65e137e32",
imageUrl
: 
"5f9015a3-22aa-4915-9cd2-2f077b542c95_jonathan-borba-8l8Yl2ruUsg-unsplash.jpg",
isAvailable
: 
false,
isCustomizable
: 
false,
name
: 
"pepper pizza",
price
: 
226,
quantity
: 
1,
restaurantId
: 
"0bf004ba-5c55-4ba5-95b2-3ad1c3ffd748",
variantId: null,
variantName: null,
variants:null
     }
  addToCart(obj,selectedVariant);
  };
  useEffect(() => {
    if (showCustomizationPopup) {
      fetch(`http://localhost:5191/api/menu/item/${selectedItemId}`)
        .then((res) => res.json())
        .then((data) => { 
          console.log("assasaa",selectedItemId);
          setItem(data.data);
          setvariants(data.data.variants || []);
        })
        .catch((err) => console.error("Error fetching menu item:", err));
    }
  }, [ showCustomizationPopup]);


  return (
    showCustomizationPopup && (
      <div className="customization-popup-overlay">
        <div className="customization-popup">
          <h3>Customize {selectedVariant?.name}</h3>
          <p>Please select options:</p>

          {variants?.length > 0 && (
            <div className="variant-options">
              {variants.map((variant) => (
                <div
                  key={variant._id}
                  className={`variant-option ${selectedVariant?._id === variant._id ? 'selected' : ''}`}
                  onClick={() => handleVariantSelect(variant)}
                >
                  <span className="variant-name">{variant.size}</span>
                  <span className="variant-price">₹{variant.price}</span>
                </div>
              ))}
            </div>
          )}

          <div className="popup-actions">
            <button
              className="cancel-button"
              onClick={() => setShowCustomizationPopup(false)}
            >
              Cancel
            </button>
            <button
              className="confirm-button"
              onClick={confirmCustomization}
              disabled={variants?.length > 0 && !selectedVariant}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default Popup;
