import React from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaTruck } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { CiBarcode } from "react-icons/ci";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { useEffect, useState, useRef } from "react";
import { uploadCourierInfo } from "../api/apiRequest";
const CourierPopup = ({ onClose, claim, onSuccess }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null); // store the selected receipt
  const [trackingNo, setTrackingNo] = useState(""); //stores consignment name
  const [isSubmitting, setIsSubmitting] = useState(false); // prevents repeated Submission
  const [courierName, setCourierName] = useState("");
  // stores courier name

  const [selectedClaim, setSelectedClaim] = useState(null); // to know about selected Claim
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      alert("Please select a PDF, JPG, or PNG file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must not exceed 5 MB.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Please select a courier receipt.");
      return;
    }

    if (!claim?.id || !claim?.ticket_id) {
      alert("Claim information is missing . Please reopen the popup");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      formData.append("claim_id", claim.id);
      formData.append("ticket_id", claim.ticket_id);
      formData.append("courier_name", courierName);
      formData.append("tracking_no", trackingNo);
      formData.append("courier_file", selectedFile);

      const response = await uploadCourierInfo(formData);
      console.log("CLAIM ID:", claim.id);
      console.log("TICKET ID:", claim.ticket_id);
      console.log("COURIER NAME:", courierName);
      console.log("TRACKING NO:", trackingNo);
      console.log("FILE:", selectedFile);
      const responseText = await response.text();
      console.log("API STATUS:", response.status);
      console.log("API RESPONSE:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (error) {
        alert("API Error: " + responseText);
        return;
      }
      if (!response.ok || result.res === false) {
        alert(result.msg || "Courier information upload failed.");
        return;
      }

      alert(result.msg || "Courier information uploaded successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Courier upload error:", error);
      alert("Something went wrong while uploading courier information.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return (
    <div className="courier-page">
      <div className="courier-popup">
        <div className="courier-header">
          <button
            type="button"
            className="courier-close-btn"
            onClick={onClose}
            aria-label="Close Popup"
          >
            <IoIosClose />
          </button>
          <h2>Upload Courier Info</h2>
          <p>
            Provide dispatch consignment details and official shipping receipts
            for real time tracking and expedited RMA resolution
          </p>
        </div>

        <div className="pdf-details">
          <div className="courier-file-heading">
            <h3>
              File(PDF/Image) <span>*</span>
            </h3>
            <small>Max 5MB</small>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf ,.jpeg ,.png,.jpg"
            hidden
            onChange={handleFileChange}
          />

          <div
            className="courier-upload-area"
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];

              if (!file) return;

              const allowedTypes = [
                "application/pdf",
                "image/jpeg",
                "image/png",
              ];

              if (!allowedTypes.includes(file.type)) {
                alert("Please select a PDF, JPG, or PNG file.");
                return;
              }

              if (file.size > 5 * 1024 * 1024) {
                alert("File size must not exceed 5 MB.");
                return;
              }

              setSelectedFile(file);
            }}
          >
            <FaCloudUploadAlt className="courier-upload-icon" />
            <div className="courier-upload-text">
              <span className="choose-file-btn">Choose File</span>
              <p>or drag & drop receipt here</p>
              <small>Supports PDF, JPG , PNG</small>
            </div>
          </div>
          {selectedFile && (
            <div className="upload-pdf-description">
              <span>
                {selectedFile.name}
                {""}
                <small>
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)}MB
                </small>
              </span>
              <MdDelete
                className="courier-delete-icon"
                onClick={removeFile}
                title="Remove file"
              />
            </div>
          )}
        </div>

        <form className="courier-form" onSubmit={handleUpload}>
          <div className="courier-input">
            <label htmlFor="Courier-name">
              Courier Name <span>*</span>
            </label>
            <div className="courier-part-input">
              <FaTruck className="courier-icon" />
              <input
                id="courier-name"
                type="text"
                placeholder="Blue Dart Express"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                required
              />
            </div>
            <p>
              Select an approved logistics partner or enter courier name
              manually
            </p>
          </div>

          <div className="consignment-input">
            <label htmlFor="consignment">
              Consignment No <span>*</span>
            </label>
            <small>AWB/Docket</small>
            <div className="consignment-part-input">
              <CiBarcode className="barcode-icon" />
              <input
                id="consignment"
                type="text"
                placeholder="AWB-8924108823"
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
                required
              />
            </div>
            <p>
              <IoIosInformationCircleOutline className="info-icon" />
              Enter the exact Air Waybill (AWB) number stamped on the physical
              receipt.
            </p>
          </div>

          <div className="dispatch-input">
            <label htmlFor="dispatch-date">Dispatch Date</label>

            <input type="text" placeholder="YYYY-MM-DD" id="dispatch-date" />
          </div>

          <div className="courier-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button
              type="submit"
              className="upload-btn"
              disabled={isSubmitting}
            >
              <FaCloudUploadAlt />
              {isSubmitting ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourierPopup;
