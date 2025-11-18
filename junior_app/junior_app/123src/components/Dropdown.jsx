import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

const Dropdown = ({ options = [], selected, setSelected, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="show-dropdown-container" ref={ref}>
      <div
        className="show-dropdown-toggle"
        onClick={() => setOpen((prev) => !prev)}
      >
        {selected || placeholder}
        <FiChevronDown
          className={`show-arrow-icon ${open ? "show-rotate" : ""}`}
        />
      </div>

      {open && (
        <ul className="show-dropdown-menu">
          {options.length === 0 ? (
            <li className="show-no-data">No Data</li>
          ) : (
            options.map((option, index) => (
              <li
                key={index}
                className={`show-dropdown-item ${
                  selected === option ? "selected" : ""
                }`}
                onClick={() => {
                  setSelected(option);
                  setOpen(false);
                }}
              >
                {option}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
