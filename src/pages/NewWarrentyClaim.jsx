import React, { useState, useRef, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { MdDelete } from "react-icons/md";
import WarehouseModal from "../components/WarehouseModal";
import { useLocation } from "react-router-dom";
import {
  getBarcodeCheck,
  getInvoiceCheck,
  WarrantySubmitApi,
} from "../api/apiRequest";
import { validateWarrantyCheck } from "../api/apiRequest";
import { FaCloudUploadAlt } from "react-icons/fa";
import { getWarrantyUserDetails } from "../api/apiRequest";
import { useLoading } from "../context/LoadingContext";
import GlobalLoader from "../layouts/GlobalLoader";
import { getWarehouseDetails } from "../api/apiRequest";
import { useNavigate } from "react-router-dom";
import { downloadShippingLabel } from "../api/apiRequest";
const NewWarrentyClaim = () => {
  // Get the data passed from the previous page
  const location = useLocation();
  // Used to navigate to another page after successful submission
  const navigate = useNavigate();
  // Reference to the customer information form
  const customerFormRef = useRef(null);
  // Receive warranty user details from the previous page
  const warrantyUser = location.state?.warrantyUser;
  // Receive verified phone number from the previous page
  const verifiedPhone = location.state?.verifiedPhone || "";
  const userDetails = warrantyUser?.user || {};
  const warrantyDetails = warrantyUser || {};
  const customerDetails = location.state?.customerDetails || {};
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [warehouseUserData, setWarehouseUserData] = useState(null);
  const [barcode, setBarcode] = useState("");
  const [isCheckingBarcode, setIsCheckingBarcode] = useState(false);
  const [barcodeMessage, setBarcodeMessage] = useState("");
  const [barcodeResult, setBarcodeResult] = useState(null);

  const [invoice, setInvoice] = useState("");
  const [invoiceMessage, setInvoiceMessage] = useState("");
  const [invoiceResult, setInvoiceResult] = useState(null);
  const [isCheckingInvoice, setIsCheckingInvoice] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyDateResult, setWarrantyDateResult] = useState(null);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [warrantyCardFile, setWarrantyCardFile] = useState(null);
  const invoiceTimer = useRef(null);
  const [warehouses, setWarehouses] = useState([]);
  const [customerFormData, setCustomerFormData] = useState({
    company_name: "",
    phone: "",
    email: "",
    gst: "",
    address: "",
    address_2: "",
    city: "",
    postal_code: "",
  });
  const { loading, startLoading, stopLoading } = useLoading();
  const [apiError, setApiError] = useState("");

  // to store all data

  // Function that create empty array for every product
  //create empty array for every product
  // Create an empty product object with all required fields
  // Each product has its own barcode, invoice, purchase date and uploaded files
  const createEmptyProduct = () => ({
    barcode: "",
    invoice: "",
    purchase_date: "",
    barcodeMessage: "",
    barcodeResult: null,
    isCheckingBarcode: false,
    invoiceMessage: "",
    invoiceResult: null,
    isCheckingInvoice: false,
    purchaseDate: "",
    purchaseDateMessage: "",
    warrantyDateResult: null,
    isCheckingWarrantyDate: false,
    invoiceFile: null,
    warrantyCardFile: null,
    suitable_spares: [],
    fileErrors: {
      invoice: "",
      warranty: "",
    },
  });
  const [rows, setRows] = useState([createEmptyProduct()]);
  // Add product code
  // Add a new empty product row without removing existing products
  const handleAddProduct = () => {
    setRows((prev) => [...prev, createEmptyProduct()]);
  }; // prev means available product before and ... prev means to preserve old products and create an empty product

  // Remove Product Code
  // Remove the selected product row
  // At least one product row must always remain
  const handleRemoveProduct = (index) => {
    if (rows.length === 1) {
      alert("At least one product is required.");
      return;
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
  };
  // UPDATE PRODUCT FUNCTION
  const updateProduct = (index, field, value) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };
  // index-which product we need to update
  //field-which product field need to be updated
  //value-which product field value need to be saved
  //prev.map)()-check all the excisting product
  //i===index-match the product index and update it
  //row,[field]:value- preserve the previous product data and change the value of new filled value

  const [fileErrors, setFileErrors] = useState({
    invoice: "",
    warranty: "",
  });
  // Validate uploaded files
  // Allow only PDF, JPG and PNG files with a maximum size of 10MB
  const handleFileChange = (index, e, type) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      updateProduct(index, "fileErrors", {
        ...rows[index].fileErrors,
        [type]: "Only PDF,JPG AND PNG FILES ARE ALLOWED.",
      });
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      updateProduct(index, "fileErrors", {
        ...rows[index].fileErrors,
        [type]: "File Size must not exceed 10MB.",
      });
      e.target.value = "";
      return;
    }

    updateProduct(index, "fileErrors", {
      ...rows[index].fileErrors,
      [type]: "",
    });

    if (type === "invoice") {
      updateProduct(index, "invoiceFile", file);
    } else {
      updateProduct(index, "warrantyCardFile", file);
    }
  };
  // Verify the entered barcode using the Barcode API
  // Check for duplicate barcodes before sending the API request
  const handleBarcodeCheck = async (index, value) => {
    const barcodeValue = value.trim();

    if (!barcodeValue) {
      updateProduct(index, "barcodeMessage", "Please enter a barcode");
      return;
    }

    if (checkDuplicateValue(index, "barcode", barcodeValue)) {
      updateProduct(index, "barcodeResult", null);
      updateProduct(index, "barcodeMessage", "Barcode already used");
      return;
    }

    try {
      updateProduct(index, "isCheckingBarcode", true);
      updateProduct(index, "barcodeMessage", "");
      updateProduct(index, "barcodeResult", null);

      const response = await getBarcodeCheck(value.trim());
      const result = await response.json();

      // console.log("Barcode Code Response", result);

      if (!response.ok) {
        throw new Error(result.message || "Barcode Check Failed");
      }

      // if(result.found){
      // //Display product details even if can_claim is false
      // updateProduct( index,"barcodeResult",result);

      // if(result.available_spare_parts > 0)
      //   updateProduct(index,"barcodeMessage",
      //           "Barcode Verified Successfully")
      // }
      // else{
      // updateProduct(
      //           index,
      //           "barcodeMessage",
      //           "All spare parts of this barcode have already been claimed"
      //         );

      // }
      // }else {
      //       updateProduct(index, "barcodeResult", null);
      //       updateProduct(
      //         index,
      //         "barcodeMessage",
      //         result.message || "Barcode not found"
      //       );
      //     }
      //   }

      if (result.found && result.can_claim === true) {
        updateProduct(index, "barcodeResult", result);
        updateProduct(index, "barcodeMessage", "Barcode Verified Successfully");
      } else if (result.found && result.can_claim === false) {
        updateProduct(index, "barcodeResult", null);
        updateProduct(
          index,
          "barcodeMessage",
          "All spare parts of this barcode have already been claimed",
        );
      } else if (result.found === false) {
        updateProduct(index, "barcodeResult", null);
        updateProduct(index, "barcodeMessage", "Barcode already claimed");
      } else {
        updateProduct(index, "barcodeResult", null);
        updateProduct(index, "barcodeMessage", "Barcode not found");
      }
    } catch (error) {
      console.error("Barcode Check Error:", error);
      updateProduct(
        index,
        "barcodeMessage",
        error.message || "Unable to Verify BarCode",
      );
    } finally {
      updateProduct(index, "isCheckingBarcode", false);
    }
  };

  //API FUNCTION TO HANDLE INVOICE
  // Verify the invoice number with the entered barcode
  // Invoice verification is performed only after barcode verification
  const handleInvoiceCheck = async (index, invoiceValue) => {
    const currentRow = rows[index];
    const invoice = invoiceValue.trim();
    const barcode = currentRow.barcode.trim();

    if (checkDuplicateValue(index, "invoice", invoice)) {
      updateProduct(index, "invoiceResult", null);
      updateProduct(index, "invoiceMessage", "Invoice number already use.");
      return;
    }

    if (!invoice) return;

    if (!barcode) {
      updateProduct(index, "invoiceMessage", "Please Scan Barcode First");
      return;
    }
    try {
      updateProduct(index, "isCheckingInvoice", true);
      updateProduct(index, "invoiceMessage", "");
      updateProduct(index, "invoiceResult", null);
      console.log("Invoice sent:", invoiceValue);
      console.log("Barcode sent:", barcode);

      const response = await getInvoiceCheck(invoice, barcode);

      const result = await response.json();

      console.log("Invoice API response:", result);
      console.log("Product Image URL:", result.productDetails?.product_image);
      console.log("Invoice Check Response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Invoice Verification failed");
      }

      if (result.res && result.found) {
        updateProduct(index, "invoiceResult", result);
        updateProduct(index, "invoiceMessage", result.message);
      } else {
        updateProduct(index, "invoiceResult", null);
        updateProduct(
          index,
          "invoiceMessage",
          result.msg || result.message || "Invoice not found",
        );
      }
    } catch (error) {
      console.error("Invoice check Error:", error);
      updateProduct(
        index,
        "invoiceMessage",
        error.message || "Unable to verify invoice.",
      );
    } finally {
      updateProduct(index, "isCheckingInvoice", false);
    }
  };

  // API TO HANDLE WARRANTY CHECK DATE
  // Validate the purchase date and check warranty status
  // Future dates are not allowed
  // Barcode and invoice must be verified before checking warranty
  const handleWarrantyDateCheck = async (index, date) => {
    updateProduct(index, "purchase_date", date);
    updateProduct(index, "purchaseDate", date);
    updateProduct(index, "warrantyDateResult", null);
    updateProduct(index, "purchaseDateMessage", "");
    if (!date) return;

    // Prevent future purchase dates
    const selectedDate = new Date(date + "T00:00:00");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      updateProduct(index, "purchase_date", "");
      updateProduct(index, "purchaseDate", "");
      updateProduct(
        index,
        "purchaseDateMessage",
        "Purchase date cannot be greater than today's date.",
      );
      return;
    }

    const currentRow = rows[index];

    console.log("Purchase Date:", date);
    if (!currentRow.barcodeResult?.found || !currentRow.invoiceResult?.found) {
      updateProduct(index, "warrantyDateResult", {
        message: "Please verify barcode and invoice first",
      });
      return;
    }

    try {
      updateProduct(index, "isCheckingWarrantyDate", true);
      const response = await validateWarrantyCheck(
        currentRow.barcode.trim(),
        currentRow.invoice.trim(),
        date,
      );

      const result = await response.json();

      console.log("Warranty date check response", result);

      if (!response.ok) {
        throw new Error(result.message || "Warranty Date verification Failed.");
      }
      updateProduct(index, "warrantyDateResult", result);
      console.log("Warranty date result", result);
    } catch (error) {
      console.error("Warranty date check Error", error);
      updateProduct(index, "warrantyDateResult", {
        message: error.message || "Warranty date verification failed.",
      });
    } finally {
      updateProduct(index, "isCheckingWarrantyDate", false);
    }
  };
  // Get the warranty expiry date and current warranty status
  const calculateWarrantyStatus = (row) => {
    if (!row.warrantyDateResult || !row.warrantyDateResult.found) return null;

    return {
      expiryDate: row.warrantyDateResult.warranty_expires_on,
      underWarranty: row.warrantyDateResult.warranty_expired == false,
    };
  };

  //API TO FETCH WAREHOUSE DETAILS
  // Fetch available warehouse details
  // Open the warehouse selection modal after successful API response
  const fetchWarehouseDetails = async () => {
    try {
      startLoading();
      const response = await getWarehouseDetails();
      console.log("Warehouse API Status:", response.status);
      console.log("Warehouse API URL:", response.url);

      const result = await response.json();

      if (response.ok && result.success) {
        setWarehouses(result.data || []);
        setShowWarehouseModal(true);
      } else {
        console.error("Failed to fetch warehouse details:", result.msg);
        alert(result.msg || "Unable to fetch warehouse details");
      }
    } catch (error) {
      console.error("Warehouse API Error", error);
    } finally {
      stopLoading();
    }
  };

  // Submit the complete warranty claim
  // Send customer details, product information, selected spare parts,
  // uploaded documents and warehouse ID using FormData
  const handleWarrantySubmit = async (warehouseId) => {
    try {
      const customerForm = customerFormRef.current;
      const FormData = new window.FormData(customerForm);
      const customerName =
        customerFormData.company_name || customerFormData.name || "";

      FormData.set("name", customerFormData.company_name || "");
      FormData.set("phone", customerFormData.phone || "");
      console.log("CUSTOMER NAME:", FormData.get("name"));
      console.log("CUSTOMER PHONE:", FormData.get("phone"));
      const gstOrAadhar = FormData.get("gst");
      FormData.delete("gst");

      if (gstOrAadhar) {
        if (gstOrAadhar.length === 15) {
          FormData.append("gst", gstOrAadhar);
        } else {
          FormData.append("aadhar", gstOrAadhar);
        }
      }
      FormData.append("warehouse_id", warehouseId);
      FormData.append("terms_and_condition", "1");

      //Product rows

      rows.forEach((row, index) => {
        FormData.append(`rows[${index}][barcode]`, row.barcode);

        FormData.append(`rows[${index}][invoice]`, row.invoice);
        FormData.append(`rows[${index}][purchase_date]`, row.purchase_date);

        row.suitable_spares.forEach((spare) => {
          FormData.append(`rows[${index}][suitable_spares][]`, spare);
        });
        if (row.warrantyCardFile) {
          FormData.append(
            `rows[${index}][warranty_card]`,
            row.warrantyCardFile,
          );
        }

        if (row.invoiceFile) {
          FormData.append(`rows[${index}][upload_invoice]`, row.invoiceFile);
        }
      });
      // PRINT COMPLETE PAYLOAD BEFORE API CALL
      console.log("========== WARRANTY CLAIM PAYLOAD ==========");
      const response = await WarrantySubmitApi(FormData);
      console.log("========== FINAL CUSTOMER DATA ==========");
      console.log("Company Name State:", customerFormData.company_name);
      console.log("Phone State:", customerFormData.phone);

      console.log("FormData name:", FormData.get("name"));
      console.log("FormData phone:", FormData.get("phone"));
      console.log("FormData email:", FormData.get("email"));
      console.log("==========================================");
      for (const [key, value] of FormData.entries()) {
        if (value instanceof File) {
          console.log(key, {
            name: value.name,
            size: `${(value.size / 1024).toFixed(2)} KB`,
            type: value.type,
          });
        } else {
          console.log(key, value);
        }
      }

      console.log("==========================================");
      const result = await response.json();
      console.log("WARRANTY SUBMIT RESPONSE:", result);

      if (!response.ok || result.res === false) {
        throw new Error(result.msg || "Warranty Submission failed.");
      }

      //GET DYNAMIC TICKET id FROM WARRANTY SUBMIT RESPONSE
      const ticketId = result.data?.claim?.ticket_id || result.data?.ticket_id;

      if (!ticketId) {
        throw new Error("Ticket ID not received from warranty API");
      }

      // Call Shipping PDF API

      const pdfResponse = await downloadShippingLabel(ticketId);
      const pdfResult = await pdfResponse.json();

      console.log("SHIPPING PDF RESPONSE:", pdfResult);

      if (!pdfResponse.ok || pdfResult.res !== true) {
        throw new Error(pdfResult.msg || "Shipping PDF generation failed.");
      }

      const pdfUrl = pdfResult.data?.pdf_url;
      const fileName = pdfResult.data?.file_name || `${ticketId}.pdf`;

      if (!pdfUrl) {
        throw new Error("PDF download URL not received");
      }
      // Open PDF in a new tab
      window.open(pdfUrl, "_blank");
      // Trigger PDF download

      const link = document.createElement("a"); // Create an anchor element means a download url
      link.href = pdfUrl; // href=downloadUrl
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowWarehouseModal(false);
      alert(
        "Warranty submitted successfully and Shipping Label download successfully!",
      );
      // Return to Warranty Claim History
      navigate("/Warranty-Claim");
    } catch (error) {
      console.error("Warranty Submit Error", error);
    }
  };

  // function to handle Spare change
  // Add or remove selected spare parts for the current product
  const handleSpareChange = (productIndex, partNumber, checked) => {
    const currentSpares = rows[productIndex].suitable_spares;

    const updatedSpares = checked
      ? [...currentSpares, partNumber]
      : currentSpares.filter((spare) => spare !== partNumber);
    updateProduct(productIndex, "suitable_spares", updatedSpares);
  };
  //productIndex- which product spare parts need to be updated
  //partNumber-which sparePart is selected
  //checked-checkbox is checked or unchecked
  //currentSpares- product currently selected spare parts
  //checked?-if the checkbox is selected then add this to array
  //.filter()-if the product is unchecked then remove this from array
  //updateProduct()-save the updated array to correct product

  const isRowWarrantyValid = (row) => {
    return (
      row.barcodeResult?.res === true &&
      row.barcodeResult?.found === true &&
      row.barcodeResult?.is_warranty === true &&
      row.invoiceResult?.found === true &&
      row.warrantyDateResult?.found === true &&
      row.warrantyDateResult?.warranty_expired === false
    );
  };

  const isSubmitDisabled = rows.some((row) => !isRowWarrantyValid(row));
  // Validate customer details and all product information before submission
  // Check duplicate values, API verification and required documents
  const validateClaimForm = () => {
    const customerForm = customerFormRef.current;

    // Customer Details Validation

    if (!customerForm.checkValidity()) {
      customerForm.reportValidity();
      return false;
    }

    // Every Product row Validation

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (checkDuplicateValue(i, "barcode", row.barcode)) {
        alert(`Duplicate Barcode in Product ${i + 1}`);
        return false;
      }

      if (checkDuplicateValue(i, "invoice", row.invoice)) {
        alert(`Duplicate invoice in Product ${i + 1}`);
        return false;
      }

      if (!row.barcode.trim()) {
        alert(`please enter Barcode for Product ${i + 1}`);
        return false;
      }

      if (!row.barcodeResult?.found) {
        alert(`Please verify Barcode for Product ${i + 1}`);
        return false;
      }

      if (!row.invoice.trim()) {
        alert(`please enter Invoice for Product ${i + 1}`);
        return false;
      }

      if (!row.invoiceResult?.found) {
        alert(`Please verify Invoice for Product ${i + 1}`);
        return false;
      }
      if (!row.purchase_date) {
        alert(`Please select Purchase Date for Product ${i + 1}`);
        return false;
      }
      if (!row.warrantyDateResult?.found) {
        alert(`Please verify warranty date for Product ${i + 1}`);
        return false;
      }

      if (row.warrantyDateResult?.warranty_expired !== false) {
        alert(`Product ${i + 1} warranty has expired.`);
        return false;
      }
      if (!row.invoiceFile) {
        alert(`Please upload Invoice for Product ${i + 1}`);
        return false;
      }

      if (!row.warrantyCardFile) {
        alert(`Please upload Warranty Card for Product ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;

    setCustomerFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (!warrantyUser) return;

    const customer = warrantyUser.user || {};
    const warranty = warrantyUser.warranty_user || warrantyUser;

    // const customerPhone = warranty.phone || verifiedPhone;

    // const customerGstin = warranty.gst || customer.gstin || customer.gst || "";

    // const customerName = customer.name || warranty.name || "";

    setCustomerFormData({
      company_name:
        customer.company_name ||
        warranty.company_name ||
        customer.name ||
        warranty.name ||
        "",
      phone: customer.phone || verifiedPhone || warranty.phone || "",
      email: customer.email || warranty.email || "",
      gst:
        warranty.gst ||
        warranty.gstin ||
        customer.gstin ||
        customer.gst ||
        customer.aadhar_card ||
        "",
      address: customer.address || warranty.address || "",
      address_2: customer.address_2 || warranty.address2 || "",
      city: customer.city || warranty.city || "",
      postal_code: customer.postal_code || warranty.postal_code || "",
    });
  }, [warrantyUser, verifiedPhone]);

  useEffect(() => {
    const loadWarrantyPage = async () => {
      try {
        startLoading();

        const response = await getWarrantyUserDetails();
        const result = await response.json();

        if (response.ok && result.res) {
          const data = result.data || {};

          // Handle both nested and direct response structures
          const warranty = data.warranty_user || data;
          const customer = data.user || warranty.user || {};
          // console.log("Warranty object:", warranty);
          // console.log("Customer object:", customer);

          setCustomerFormData({
            company_name:
              customer.company_name ||
              customer.name ||
              warranty.company_name ||
              warranty.name ||
              "",
            phone: customer.phone || verifiedPhone || warranty.phone || "",

            email: customer.email || warranty.email || "",

            gst:
              warranty.gst ||
              warranty.gstin ||
              customer.gst ||
              customer.aadhar_card ||
              customer.gstin ||
              warranty.aadhar_card ||
              "",

            address: customer.address || warranty.address || "",

            address_2:
              customer.address_2 ||
              customer.address2 ||
              warranty.address_2 ||
              warranty.address2 ||
              "",

            city: customer.city || warranty.city || "",

            postal_code:
              customer.postal_code ||
              warranty.postal_code ||
              warranty.pincode ||
              "",
          });
          setWarehouseUserData(result.data);
        }
      } catch (error) {
        console.error("Warranty page loading error:", error);
        setApiError(error.message || "Unable to load customer details");
      } finally {
        stopLoading();
      }
    };

    loadWarrantyPage();
  }, []);

  // Check wheather a value already exists in another product row

  const checkDuplicateValue = (currentIndex, field, value) => {
    const normalizedValue = String(value || "")
      .trim()
      .toLowerCase();

    if (!normalizedValue) return false;

    return rows.some((row, index) => {
      // check every row
      if (index === currentIndex) return false;
      const excistingValue = String(row[field] || "")
        .trim()
        .toLowerCase();

      return excistingValue === normalizedValue;
    });
  };

  return (
    <MainLayout>
      <div className="new-warranty-page">
        <GlobalLoader section show={loading} />
        {apiError ? (
          <div className="warranty-api-error">
            <h3>Unable to Load Warranty Details</h3>
            <p>{apiError}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        ) : (
          <div style={{ visibility: loading ? "hidden" : "visible" }}>
            <div className="new-warranty-text">
              <p>New Warranty Claim Registration</p>
              <p>
                Enter Customer and business information, scan or enter serial &
                barcode credentials, and attach authorized purchase verification
                records for streamlined RMA servicing
              </p>
            </div>

            <div className="dealer-info">
              <strong>01</strong>
              <p>
                Dealer & Customer Information
                <br />
                Primary enterprise biling account and on-site servicing
                recipient
              </p>
            </div>

            <form className="warranty-form " ref={customerFormRef}>
              <div className="forms-group">
                <label>
                  Business/Customer Name<span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  placeholder="Mazing Retail Private Limited"
                  required
                  value={customerFormData.company_name}
                  onChange={handleCustomerChange}
                />
              </div>

              <div className="forms-group">
                <label>
                  Phone Number<span className="required-star">*</span>
                </label>
                <div className="phone-field">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your Phone Number"
                    value={customerFormData.phone}
                    onChange={handleCustomerChange}
                    required
                  />
                </div>
              </div>

              <div className="forms-group">
                <label>Official Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="rahul@example.com"
                  value={customerFormData.email}
                  onChange={handleCustomerChange}
                  required
                />
              </div>

              <div className="forms-group">
                <label>
                  Aadhar/GSTIN/Tax ID <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="gst"
                  placeholder="07AAAA0000A1Z5"
                  value={customerFormData.gst}
                  onChange={handleCustomerChange}
                />
              </div>

              <div className="forms-group">
                <label>Primary Street Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Rama Road Industrial Area 123, New Delhi"
                  value={customerFormData.address}
                  onChange={handleCustomerChange}
                />
              </div>
              <div className="forms-group">
                <label>Address Line 2/Landmark</label>
                <input
                  type="text"
                  name="address_2"
                  placeholder="Landmark"
                  value={customerFormData.address_2}
                  onChange={handleCustomerChange}
                />
              </div>

              <div className="forms-group">
                <label>City/district</label>
                <input
                  type="text"
                  name="city"
                  placeholder="West Delhi"
                  value={customerFormData.city}
                  onChange={handleCustomerChange}
                />
              </div>
              {/* PinCode */}
              <div className="forms-group">
                <label>PIN Code/Postal Area</label>
                <input
                  type="text"
                  name="postal_code"
                  placeholder="110015"
                  value={customerFormData.postal_code}
                  onChange={handleCustomerChange}
                />
              </div>
              {/* Display all product rows dynamically */}
            </form>
            {rows.map((row, index) => (
              <React.Fragment key={index}>
                <div className="product-credentials">
                  <strong>02</strong>
                  <p>
                    Product & Warranty Credentials <br />
                    Attach verifies serial identifiers , purchase receipts and
                    warranty cards
                  </p>
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    className="submit-btn"
                  >
                    + Add Another Product
                  </button>
                </div>

                <div className="equipment-text">
                  <p>Product Item {index + 1} </p>
                  <p>Primary Equipment</p>
                  <MdDelete
                    className="delete-icon"
                    onClick={() => handleRemoveProduct(index)}
                  />
                </div>

                <div className="warranty-form product-credentials-form">
                  <div className="forms-group">
                    <label>
                      Bar Code/Serial No{" "}
                      <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="BarCode/Serial No"
                      value={row.barcode} // update current product barcode
                      onChange={(e) => {
                        const value = e.target.value;
                        updateProduct(index, "barcode", value); // save the current product barcode
                        updateProduct(index, "barcodeMessage", null);
                        updateProduct(index, "barcodeResult", null);
                        updateProduct(index, "invoiceResult", null);
                        updateProduct(index, "invoiceMessage", "");
                        updateProduct(index, "warrantyDateResult", null);
                        const isDuplicate = checkDuplicateValue(
                          index,
                          "barcode",
                          value,
                        );
                        updateProduct(
                          index,
                          "barcodeMessage",
                          isDuplicate ? "Barcode already used." : "",
                        );
                        if (isDuplicate) return;

                        if (value.trim()) {
                          handleBarcodeCheck(index, value);
                        }
                      }}
                      required
                    />
                    {row.isCheckingBarcode && <p>Verifying barcode...</p>}
                    {row.barcodeMessage && !row.isCheckingBarcode && (
                      <p
                        style={{
                          color: row.barcodeResult ? "green" : "red",
                          marginTop: "0px",
                          fontSize: "13px",
                        }}
                      >
                        {row.barcodeMessage}
                      </p>
                    )}
                  </div>

                  <div className="forms-group">
                    <label>
                      Invoice No <span className="required-star">*</span>
                    </label>

                    <input
                      type="text"
                      placeholder="Invoice No."
                      value={row.invoice} // to show the current product invoice
                      required
                      onChange={(e) => {
                        const value = e.target.value;
                        updateProduct(index, "invoice", value);
                        updateProduct(index, "invoiceMessage", ""); // old verification message is removed
                        updateProduct(index, "invoiceResult", null); // to remove old invoice verification message
                        updateProduct(index, "warrantyDateResult", null);

                        clearTimeout(invoiceTimer.current);
                        const isDuplicate = checkDuplicateValue(
                          index,
                          "invoice",
                          value,
                        );
                        if (isDuplicate) {
                          updateProduct(
                            index,
                            "invoiceMessage",
                            isDuplicate ? "Invoice number already used." : "",
                          );
                          return;
                        }
                        if (value.trim() && row.barcodeResult?.found) {
                          invoiceTimer.current = setTimeout(() => {
                            handleInvoiceCheck(index, value);
                          }, 700);
                        }
                      }}
                    />
                    {row.isCheckingInvoice && <p>Verifying Invoice...</p>}
                    {row.invoiceMessage && (
                      <p
                        style={{
                          color: row.invoiceResult ? "green" : "red",
                          marginTop: "0px",
                          fontSize: "13px",
                        }}
                      >
                        {row.invoiceMessage}
                      </p>
                    )}
                  </div>
                  <div className="forms-group">
                    <label>
                      Purchase Date<span className="required-star">*</span>
                    </label>
                    <input
                      type="date"
                      placeholder="YYYY-MM-DD"
                      value={row.purchaseDate}
                      onChange={(e) =>
                        handleWarrantyDateCheck(index, e.target.value)
                      }
                      max={new Date().toLocaleDateString("en-CA")}
                      required
                    />
                    {row.isCheckingWarrantyDate && (
                      <p style={{ color: "#07558a", fontSize: "13px" }}>
                        Checking purchase date...
                      </p>
                    )}

                    {/* Show Verification Message */}
                    {row.warrantyDateResult?.message && (
                      <p style={{ color: "red", fontSize: "13px" }}>
                        {row.warrantyDateResult.message}
                      </p>
                    )}

                    {row.purchaseDateMessage && (
                      <p
                        style={{
                          color: "red",
                          marginTop: "0px",
                          fontSize: "13px",
                        }}
                      >
                        {row.purchaseDateMessage}
                      </p>
                    )}

                    {row.warrantyDateResult?.found && (
                      <div style={{ marginTop: "5px" }}>
                        <p
                          style={{
                            color:
                              row.warrantyDateResult.warranty_expired === false
                                ? "green"
                                : "red",
                            marginTop: "0px",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                        >
                          {row.warrantyDateResult.warranty_expired
                            ? "Product is not under warranty"
                            : "Product is under warranty"}
                        </p>

                        {/* <p style={{ fontSize: "13px" }}>
                          Warranty Expiry Date:{" "}
                          {row.warrantyDateResult.warranty_expires_on}
                        </p> */}
                      </div>
                    )}
                  </div>
                </div>
                <div className="invoice-record">
                  <div className="upload-record">
                    <div className="upload-record-heading">
                      <div>
                        <p>
                          Upload Invoice Record{" "}
                          <span className="required-star">*</span>
                        </p>
                        <span>PDF,JPG,PNG(Max 10MB)</span>
                      </div>
                    </div>

                    <label className="upload-file-box">
                      <input
                        key={
                          row.invoiceFile ? "invoice-selected" : "invoice-empty"
                        }
                        type="file"
                        accept=".pdf,.jpeg,.png,.jpg"
                        onChange={(e) => handleFileChange(index, e, "invoice")}
                      />

                      <FaCloudUploadAlt className="upload-icon" />
                      <span>Click to upload invoice</span>
                    </label>

                    {row.fileErrors.invoice && (
                      <p className="upload-error">{row.fileErrors.invoice}</p>
                    )}

                    {row.invoiceFile && (
                      <div className="uploaded-file">
                        <div>
                          <strong>{row.invoiceFile.name}</strong>
                          <span>
                            {(row.invoiceFile.size / 1024).toFixed(2)}KB{""}
                            .selected
                          </span>
                        </div>

                        <MdDelete
                          className="delete-icon"
                          onClick={() => {
                            updateProduct(index, "invoiceFile", null);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Warranty Card Upload*/}

                  <div className="upload-record">
                    <div className="upload-record-heading">
                      <div>
                        <p>
                          Upload Warranty Record{" "}
                          <span className="required-star">*</span>
                        </p>
                        <span>Stamped Tag Proof(PDF,JPG,PNG)</span>
                      </div>
                    </div>

                    <label className="upload-file-box">
                      <input
                        key={
                          row.warrantyCardFile
                            ? "warranty-selected"
                            : "warranty-empty"
                        }
                        type="file"
                        accept=".pdf,.jpeg,.png,.jpg"
                        onChange={(e) => handleFileChange(index, e, "warranty")}
                      />

                      <FaCloudUploadAlt className="upload-icon" />
                      <span>Click to upload warranty card</span>
                    </label>

                    {row.fileErrors.warranty && (
                      <p className="upload-error">{row.fileErrors.warranty}</p>
                    )}

                    {row.warrantyCardFile && (
                      <div className="uploaded-file">
                        <div>
                          <strong>{row.warrantyCardFile.name}</strong>
                          <span>
                            {(row.warrantyCardFile.size / 1024).toFixed(2)}KB
                            {""}
                            .selected
                          </span>
                        </div>

                        <MdDelete
                          className="delete-icon"
                          onClick={() => {
                            updateProduct(index, "warrantyCardFile", null);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {row.barcodeResult?.found && (
                  <div className="warranty-content-layout">
                    <div className="warranty-product-image">
                      <div className="tools-description">
                        <h3>GENUINE TOOL</h3>
                        <p>
                          Part #{row.barcodeResult?.productDetails?.part_no}
                        </p>
                      </div>

                      <h2>{row.barcodeResult?.productDetails?.name}</h2>
                      {row.barcodeResult?.productDetails?.product_image && (
                        <img
                          src={row.barcodeResult?.productDetails.product_image}
                          className="warranty-tool-img"
                          alt={row.barcodeResult?.productDetails?.name}
                        />
                      )}

                      <div className="warranty-details">
                        <div className="warranty-detail">
                          {/* <h3>Warranty Policy Coverage:</h3>
                          <p>
                            {row.barcodeResult?.warranty_months ||
                              row.barcodeResult?.productDetails
                                ?.warranty_duration}
                            Months
                          </p>
                          <span>(Standard)</span> */}
                        </div>
                        {row.warrantyDateResult?.found &&
                          row.warrantyDateResult?.warranty_expires_on && (
                            <div className="warranty-detail">
                              {/* <h3>Remaining Warranty Life:</h3>
                              <p>
                                {row.warrantyDateResult.warranty_expires_on}
                              </p> */}
                            </div>
                          )}
                      </div>
                    </div>
                    <div className="warranty-components">
                      <h3>Covered in Warranty Components</h3>

                      <div className="warranty-components-text">
                        {/* <h3>
                          {row.barcodeResult?.suitableSpareParts?.length || 0}{" "}
                          ITEMS AVAILABLE
                        </h3> */}
                      </div>

                      <div className="warranty-components-cards">
                        {row.barcodeResult?.suitableSpareParts?.map(
                          (part, spareIndex) => {
                            const alreadyApplied =
                              Number(part.already_applied) === 1;
                            return (
                              <div
                                className={`warranty-components-card ${alreadyApplied ? "already-applied" : ""}`}
                                key={part.product_id || spareIndex}
                              >
                                <h3>{part.part_number}</h3>
                                <input
                                  type="checkbox"
                                  checked={
                                    !alreadyApplied &&
                                    row.suitable_spares.includes(
                                      part.part_number,
                                    )
                                  }
                                  disabled={alreadyApplied}
                                  onChange={(e) =>
                                    handleSpareChange(
                                      index,
                                      part.part_number,
                                      e.target.checked,
                                    )
                                  }
                                />
                                {part.spareImage && (
                                  <img
                                    src={part.spareImage}
                                    alt={part.product_name}
                                  />
                                )}

                                <h3>{part.product_name}</h3>

                                {alreadyApplied && (
                                  <span className="already-applied-label">
                                    Already Claimed
                                  </span>
                                )}
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}

            <button
              type="button"
              className="submit-btn"
              disabled={isSubmitDisabled}
              onClick={() => {
                if (validateClaimForm()) {
                  fetchWarehouseDetails();
                }
              }}
            >
              Submit
            </button>
            {showWarehouseModal && (
              <WarehouseModal
                onClose={() => setShowWarehouseModal(false)}
                warehouses={warehouses}
                rows={rows}
                onConfirm={handleWarrantySubmit}
              />
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NewWarrentyClaim;
