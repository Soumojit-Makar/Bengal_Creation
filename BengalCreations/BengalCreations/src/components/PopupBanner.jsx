import { useEffect, useState } from "react";
// import "./PopupBanner.css";

const PopupBanner = ({
  delay = 1500,
  title = "🔥 Special Offer",
  message = "Get 20% OFF on your first order!",
  buttonText = "Shop Now",
  onClick,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("promo_seen");

    if (!seen) {
      const timer = setTimeout(() => {
        setShow(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  const closePopup = () => {
    setShow(false);
    localStorage.setItem("promo_seen", "true");
  };

  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <button className="close-btn" onClick={closePopup}>
          ×
        </button>

        <h2>{title}</h2>
        <p>{message}</p>

        <button
          className="shop-btn"
          onClick={() => {
            closePopup();
            if (onClick) onClick();
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default PopupBanner;