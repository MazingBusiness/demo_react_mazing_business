import React, { useState } from "react";
import { FaWarehouse } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { useRef } from "react";
const WarehouseModal = ({ onClose,onConfirm, rows ,warehouses}) => {
  const warehouseSelectRef = useRef(null);

  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  return (
    <div className="warehouse-overlay">
      <div className="warehouse-modal">
        <div className="warehouse-modal-header">
          <div className="warehouse-icon">
            <FaWarehouse />
          </div>
          <h2>Warehouse Intake</h2>
          <button
            className="warehouse-close-icon"
            type="button"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        <div className="warehouse-modal-body">
          {/* Warehouse Selection*/}
          <div className="warehouse-select-box">
            <h3>Select Warehouse</h3>

            <div className="warehouse-select">
              <FaMapMarkerAlt />

              <select
                ref={warehouseSelectRef}
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                aria-label="Select warehouse"
              >
              <option value="">Select Warehouse</option>
              {warehouses?.map((warehouse)=>(
                  <option key={warehouse.warehouse_id} 
                  value={warehouse.warehouse_id}
                  >
                    Warehouse {warehouse.warehouse_id} - {warehouse.warehouse_name}
                  </option>
              ))}
              </select>
              <FaChevronDown
                className="warehouse-dropdown-icon"
                onClick={() => warehouseSelectRef.current?.click()}
              />
            </div>
          </div>
          {/* Approved Replacement Parts */}

          <div className="warehouse-details">
            {rows?.map((row, index) => (
              <div key={index}>
                {row.suitable_spares.map((partNumber) => {
                  const part = row.barcodeResult?.suitableSpareParts?.find(
                    (item) => item.part_number === partNumber,
                  );

                  if (!part) return null;

                  return (
                    <div key={partNumber}  className="warehouse-part">
                       <div className="warehouse-part-name">
                      <FaCheckCircle /> 
                      <span>
                         {part.part_number}-{part.product_name}
                      </span>
                    </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Warehouse Footer */}
        <div className="warehouse-modal-footer">
          <button className="warehouse-preview-btn" onClick={onClose}>
            Close Preview
          </button>
          <button
            type="button"
            className="submit-btn"
            disabled={!selectedWarehouse}
            onClick={() => onConfirm(selectedWarehouse)}
          >
            Confirm & Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarehouseModal;
