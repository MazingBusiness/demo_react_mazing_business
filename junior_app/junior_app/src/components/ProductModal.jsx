import React, { useEffect, useRef } from "react";
import sampleProduct from "../assets/images/product.jpg";
import HeartIcon from "../assets/icons/HeartIcon.svg";
import CartIcon from "../assets/icons/CartIcon.svg";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

const ProductModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`product-modal-overlay ${isOpen ? "open" : ""}`}>
      <div
        className={`product-modal-box ${isOpen ? "open" : ""}`}
        ref={modalRef}
      >
        <button className="product-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="product-modal-grid">hi</div>
      </div>
    </div>
  );
};

export default ProductModal;
