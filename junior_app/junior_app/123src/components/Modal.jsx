import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

const sizeMap = {
  sm: "400px",
  md: "600px",
  lg: "780px",
  xlg: "980px",
};

const Modal = ({
  isOpen,
  onClose,
  onSave,
  onCancel,
  children,
  showFooter = false,
  size = "lg",
}) => {
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
      setTimeout(() => setShouldRender(false), 400); // match CSS transition
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className="ba-modal-overlay" onClick={onClose}>
      <div
        className={`ba-modal-container ${visible ? "show" : ""}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: sizeMap[size] || sizeMap.lg }}
      >
        <button className="ba-modal-close" onClick={onClose}>
          <FiX />
        </button>

        <div className="ba-modal-body">{children}</div>

        {showFooter && (
          <div className="ba-modal-footer">
            <button
              className="ba-btn ba-cancel-btn"
              onClick={onCancel || onClose}
            >
              Cancel
            </button>
            <button className="ba-btn ba-save-btn" onClick={onSave}>
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
