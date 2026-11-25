import React, { useEffect, useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";

import { FaRegCheckCircle } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { FaCloudUploadAlt } from "react-icons/fa";
import CourierPopUp from "../components/CourierPopup.jsx";
import MainLayout from "../layouts/MainLayout";
import { getWarrantyDetails, getWarrantyClaims } from "../api/apiRequest.jsx";
import { useNavigate } from "react-router-dom";
import { getWarrantyUserTypePost } from "../api/apiRequest.jsx";
import { checkGstIN } from "../api/apiRequest.jsx";
import { getWarrantyUserDetails } from "../api/apiRequest.jsx";
import { useLocation } from "react-router-dom";
import { useLoading } from "../context/LoadingContext.jsx";
import GlobalLoader from "../layouts/GlobalLoader.jsx";
import { VerifyGstin } from "../api/apiRequest.jsx";
import { getWarrantyStateList } from "../api/apiRequest.jsx";

// Initial values for the registration form
const initialFormData = {
  accountType: "Sub-Dealer",
  gstin: "",
  mobile: "",
  email: "",
  fullName: "",
  companyName: "",
  aadhaar: "",
  address1: "",
  address2: "",
  city: "",
  pincode: "",
  declaration: false,
  state: "West Bengal",
};

const WarrantyClaim = () => {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [isCourierPopUpOpen, setIsCourierPopUpOpen] = useState(false);
  // Registration form states
  const [noGstin, setNoGstIn] = useState(false);
  const [FormData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Warranty claims states
  const [claims, setClaims] = useState([]); // stored the warranty claims returned by the api
  const [loadingClaims, setLoadingClaims] = useState(false); // tell the page that the aqi  request is still running
  const [claimsError, setClaimsError] = useState(""); //stores an error message if request fails
  const [activeFilter, setActiveFilter] = useState("ALL"); // remember which status filter the user selected
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // stores what the user type in the search box

  // GSTIN verification states
  const [isGstinVerifying, setIsGstinVerifying] = useState(false);
  const [gstinVerified, setGstInVerified] = useState(false);
  const [gstinAlreadyExists, setGstinAlreadyExists] = useState(false);

  // Warranty user states
  const [isExistingWarrantyUser, setIsExistingWarrantyUser] = useState(false);
  const [checkingWarrantyUser, setCheckingWarrantyUser] = useState(true);
  const [warrantyUser, setWarrantyUser] = useState(null);

  // Global loading and error states
  const { loading, startLoading, stopLoading } = useLoading();
  const [apiError, setApiError] = useState("");
  // State dropdown states
  const [states, setStates] = useState([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);

  const claimsPerPage = 5;

  useEffect(() => {
    document.body.style.overflow = isModalOpen || isKycOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen, isKycOpen]);

  const navigate = useNavigate();
  const location = useLocation();

  // Get the OTP-verified mobile number
  const verifiedPhone = (
    sessionStorage.getItem("warrantyVerifiedPhone") ||
    location.state?.verifiedPhone ||
    ""
  )
    .replace(/\D/g, "")
    .slice(-10);
  // Fetch all warranty claims from the API
  const fetchClaims = async () => {
    try {
      startLoading();
      setLoadingClaims(true);
      setClaimsError("");

      const response = await getWarrantyClaims();
      const result = await response.json();

      if (!response.ok || !result.res) {
        throw new Error(result.msg || "Failed to fetch the Warranty Claims");
      }

      const claimsList =
        result.data?.warranty_claims ?? result.data?.claims ?? [];

      setClaims(claimsList);
      setCurrentPage(1);
    } catch (error) {
      console.error("Warranty Claims Error", error);
      setApiError("Unable to load warranty claims.Please try again later.");
      setClaimsError(error.message || "Unable to Load the Claims");
    } finally {
      setLoadingClaims(false);
      stopLoading();
    }
  };
  // Fetch claims whenever the route changes
  useEffect(() => {
    fetchClaims();
  }, [location.key]);

  // Check whether the current mobile number belongs to an existing warranty user
  useEffect(() => {
    const checkWarrantyUser = async () => {
      try {
        setCheckingWarrantyUser(true);
        startLoading();
        console.log(
          "CURRENT PHONE:",
          sessionStorage.getItem("warrantyVerifiedPhone"),
        );
        const response = await getWarrantyUserDetails();
        const result = await response.json();

        if (!response.ok || !result.res) {
          throw new Error(result.msg || "Failed to get warranty user details");
        }
        const apiWarrantyUser = result.data?.warranty_user;
        const apiUser =
          result.data?.customer ||
          result.data?.user ||
          result.data?.customer_details ||
          result.data?.warranty_user?.customer ||
          result.data;
        const enteredPhone = verifiedPhone.replace(/\D/g, "").slice(-10);
        const apiPhone = (apiWarrantyUser?.phone || apiUser?.phone || "")
          .replace(/\D/g, "")
          .slice(-10);
        // Verify that the API phone matches the OTP-verified phone
        if (apiWarrantyUser?.id && enteredPhone && enteredPhone === apiPhone) {
          const isRegistered =
            !!apiUser?.id &&
            !!apiUser?.company_name &&
            !!apiUser?.phone &&
            (!!apiUser?.gstin || !!apiUser?.aadhar_card) &&
            enteredPhone === apiPhone;
          setWarrantyUser({
            ...apiWarrantyUser,
            user: apiUser || {},
          });

          setIsExistingWarrantyUser(isRegistered);
        } else {
          setIsExistingWarrantyUser(false);
          setWarrantyUser(null);
        }
      } catch (error) {
        console.error("Warranty User Details Error:", error);
        setIsExistingWarrantyUser(false);
        setWarrantyUser(null);
        setApiError(
          "Unable to load warranty user details. Please try again later.",
        );
      } finally {
        setCheckingWarrantyUser(false);
        stopLoading();
      }
    };

    checkWarrantyUser();
  }, [verifiedPhone]);
  // Update form fields dynamically
  function updateField(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }
  // Open the first registration popup or navigate existing users
  const openFirstModal = () => {
    if (checkingWarrantyUser) return;
    // Existing users can directly create a new warranty claim
    if (isExistingWarrantyUser && warrantyUser) {
      navigate("/new-warrenty-claim", {
        state: {
          warrantyUser,
          verifiedPhone: verifiedPhone,
        },
      });
      return;
    }
    // First-time user: open GST/KYC popup
    setFormData({
      ...initialFormData,
      mobile: verifiedPhone.replace(/\D/g, "").slice(-10),
    });
    setNoGstIn(false);
    setIsKycOpen(false);
    setIsModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setIsKycOpen(false);
  };
  // Move from GSTIN details to KYC form
  const goToKyc = (e) => {
    e.preventDefault();
    if (!noGstin && !gstinVerified) {
      alert("Please verify your GSTIN first");
      return;
    }
    setIsModalOpen(false);
    setIsKycOpen(true);
  };

  const goBackToDetails = () => {
    setIsKycOpen(false);
    setIsModalOpen(true);
  };
  // Submit the registration form
  const submitFrontendForm = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    const aadhaar = String(FormData.aadhaar || "").trim();
    const gstin = String(FormData.gstin || "")
      .trim()
      .toUpperCase();

    // At least one field is compulsory
    if (!gstin && !aadhaar) {
      alert("Please enter either GSTIN or Aadhaar Number.");
      return;
    }

    // Validate Aadhaar only if entered
    if (aadhaar && !/^\d{12}$/.test(aadhaar)) {
      alert("Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    // Format mobile number with +91
    const formattedMobile = FormData.mobile ? `+91${FormData.mobile}` : "";
    try {
      setIsSubmitting(true);
      // Prepare registration payload
      const payload = {
        name: FormData.fullName,
        company_name: FormData.companyName,
        address: FormData.address1,
        address2: FormData.address2,
        postal_code: FormData.pincode,
        email: FormData.email,
        phone: formattedMobile,
        gstin: noGstin ? null : FormData.gstin,
        aadhar_card: aadhaar || null,
        city: FormData.city,
        state: FormData.state,
        user_type: "customer",
      };
      console.log("SENDING REGISTRATION DATA:", payload);
      const response = await getWarrantyUserTypePost(payload);
      const result = await response.json();
      console.log("REGISTRATION API RESPONSE:", result);
      console.log("REGISTRATION CUSTOMER ID:", result.data?.customer?.id);
      console.log("REGISTRATION CUSTOMER:", result.data?.customer);

      console.log("WARRANTY USER:", result.data?.warranty_user);
      console.log("CUSTOMER:", result.data?.customer);
      console.log("FULL REGISTRATION RESPONSE:", result);
      if (!response.ok || !result.res) {
        throw new Error(result.msg || "Failed to update warranty profile");
      }

      alert(result.msg || "Warranty Registration Successfully");
      const updatedWarrantyUser = result.data?.warranty_user;

      if (updatedWarrantyUser) {
        setWarrantyUser(updatedWarrantyUser);
      }
      setIsExistingWarrantyUser(true);
      setIsKycOpen(false);
      setIsModalOpen(false);
      // Navigate to the new warranty claim page
      navigate("/new-warrenty-claim", {
        state: {
          verifiedPhone,
          warrantyUser: updatedWarrantyUser || warrantyUser,
          customerDetails: {
            company_name: FormData.companyName || FormData.fullName,
            phone: formattedMobile,
            email: FormData.email,
            gst: FormData.gstin || "",
            aadhar_card: FormData.aadhaar || "",
            address: FormData.address1,
            address_2: FormData.address2,
            city: FormData.city,
            postal_code: FormData.pincode,
          },
        },
      });
    } catch (error) {
      console.error("Warranty User Type API error:", error);
      alert(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  //// Function to call the get Warranty Details

  const handleViewDetails = async (ticketId) => {
    try {
      startLoading();
      const response = await getWarrantyDetails(ticketId);

      if (!response.ok) {
        throw new Error("Failed to fetch warranty details");
      }
      const result = await response.json();
      if (!result || result.res === false) {
        throw new Error(result?.msg || "Failed to fetch details");
      }
      navigate(`/warranty-claim-detail/${ticketId}`, {
        state: {
          warrantyDetails: result.data,
        },
      });
    } catch (error) {
      console.error("Unable top view Warranty Details", error);
      setApiError("Unable to load Warranty Details. Please try again later.");
    } finally {
      stopLoading();
    }
  };
  // Convert claim status into lowercase for consistent comparison
  const normalizeStatus = (status) => {
    return String(status || "")
      .trim()
      .toLowerCase();
  };
  // Calculate warranty claim statistics
  const totalClaims = claims.length;
  const underReview = claims.filter(
    (claim) => normalizeStatus(claim.status) === "pending",
  ).length;

  const InService = claims.filter(
    (claim) => normalizeStatus(claim.status) === "in service center",
  ).length;
  const Resolved = claims.filter(
    (claim) => normalizeStatus(claim.status) === "resolved",
  ).length;
  // Calculate claims submitted during the current month
  const currentDate = new Date();
  const submittedThisMonth = claims.filter((claim) => {
    const claimDate = new Date(claim.created_at);

    return (
      claimDate.getMonth() === currentDate.getMonth() &&
      claimDate.getFullYear() === currentDate.getFullYear()
    );
  }).length;

  //Calculation of filtered Claims

  const filteredClaims = claims.filter((claim) => {
    const status = normalizeStatus(claim.status);

    if (activeFilter === "ALL") return true;

    if (activeFilter === "Under Review") {
      return status === "pending";
    }

    return status === normalizeStatus(activeFilter);
  });
  // Calculate pagination values
  const indexOfLastClaim = currentPage * claimsPerPage;
  const indexOfFirstClaim = indexOfLastClaim - claimsPerPage;

  const currentClaims = filteredClaims.slice(
    indexOfFirstClaim,
    indexOfLastClaim,
  );

  const totalPages = Math.ceil(filteredClaims.length / claimsPerPage);

  /// Calling API from apirequest to handleGSTVerify
  // Verify GSTIN and check whether it already exists in the warranty system
  const handleGstinVerify = async () => {
    const gstin = FormData.gstin.trim().toUpperCase();
    setGstinAlreadyExists(false);
    if (!gstin) {
      alert("Please enter GSTIN");
      return;
    }
    if (gstin.length !== 15) {
      alert("GSTIN must be exactly 15 characters.");
      return;
    }
    // Basic GSTIN format validation
    const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

    if (!gstinPattern.test(gstin)) {
      alert("Please enter a valid GSTIN format.");
      return;
    }
    try {
      setIsGstinVerifying(true);
      setGstInVerified(false);
      // FIRST API: Verify actual GST registration
      const verifyResponse = await VerifyGstin(gstin);
      const verifyResult = await verifyResponse.json();
      // Stop if the GSTIN already exists
      if (
        verifyResult?.res === false &&
        verifyResult?.msg?.toLowerCase().includes("already exists")
      ) {
        setGstInVerified(false);
        setGstinAlreadyExists(true);
        return;
      }
      if (!verifyResponse.ok || verifyResult?.res !== true) {
        throw new Error(
          verifyResult?.msg ||
            verifyResult?.message ||
            "Invalid GSTIN. Please enter a valid GSTIN.",
        );
      }

      // SECOND: Check whether GSTIN already exists in warranty
      const warrantyResponse = await checkGstIN(gstin);
      const warrantyResult = await warrantyResponse.json();

      console.log("WARRANTY GSTIN RESPONSE:", warrantyResult);

      console.log("WARRANTY GSTIN RESPONSE:", warrantyResult);
      console.log("EXISTS VALUE:", warrantyResult?.exists);
      console.log("EXISTS TYPE:", typeof warrantyResult?.exists);

      if (!warrantyResponse.ok || warrantyResult?.res !== true) {
        throw new Error(warrantyResult?.msg || "Warranty GSTIN check failed");
      }
      // GSTIN already exists: stop without autofilling
      if (warrantyResult?.exists === true) {
        setGstInVerified(false);
        setGstinAlreadyExists(true);
        alert(
          "This GSTIN already exists in our system. Please enter a different GSTIN associated with your business.",
        );
        return;
      }

      // GSTIN is valid and does not exist in warranty system
      if (warrantyResult?.exists === false) {
        const taxpayerInfo =
          verifyResult?.data?.gst_data?.taxpayerInfo ??
          verifyResult?.gst_data?.taxpayerInfo ??
          verifyResult?.data?.taxpayerInfo ??
          verifyResult?.taxpayerInfo;

        const gstData =
          verifyResult?.data?.name || verifyResult?.data?.address
            ? verifyResult.data
            : verifyResult;

        // Automatically fill available company and address details
        setFormData((prev) => ({
          ...prev,

          companyName:
            taxpayerInfo?.tradeNam ??
            gstData?.tradeNam ??
            gstData?.name ??
            prev.companyName,

          address1: gstData?.address ?? prev.address1,
          address2: gstData?.address2 ?? prev.address2,
          pincode: gstData?.postal_code ?? prev.pincode,
          city: gstData?.city ?? prev.city,

          state:
            states.find(
              (item) =>
                item.name.trim().toLowerCase() ===
                String(gstData?.state ?? "")
                  .trim()
                  .toLowerCase(),
            )?.name ?? prev.state,
        }));

        setGstInVerified(true);

        alert("GSTIN verified and details fetched successfully!");
      }
    } catch (error) {
      setGstInVerified(false);
      console.error("GSTIN Verification Error", error);
      alert(error.message || "GSTIN verification failed.");
    } finally {
      setIsGstinVerifying(false);
    }
  };
  // console.log("CLAIMS STATE COUNT:", claims.length);
  // Fetch the state list for the KYC dropdown
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setIsLoadingStates(true);

        const result = await getWarrantyStateList();

        // console.log("WARRANTY STATE RESPONSE:", result);

        // State array is inside result.state
        const stateList = Array.isArray(result?.state) ? result.state : [];

        // console.log("STATE LIST:", stateList);
        // console.log("TOTAL STATES:", stateList.length);

        setStates(stateList);
      } catch (error) {
        console.error("STATE API ERROR:", error);
      } finally {
        setIsLoadingStates(false);
      }
    };

    fetchStates();
  }, []);

  // console.log("State dropdown debug:", {
  //   statesCount: states.length,
  //   isLoadingStates,
  //   states: states,
  // });

  return (
    <MainLayout>
      <div className="warranty-claim-page">
        <GlobalLoader section show={loading} />
        {apiError ? (
          <div className="warranty-api-error">
            <h3>Unable to Load Warranty Details</h3>
            <p>{apiError}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        ) : (
          <div style={{ visibility: loading ? "hidden" : "visible" }}>
            <div className="warranty-page-title">
              <h1>Warranty Claim </h1>

              <button
                className="new-warranty-claim-btn"
                onClick={openFirstModal}
              >
                + New Warranty Claim
              </button>
            </div>
            {/* Warranty claim summary cards */}
            <div className="warranty-cards">
              <div className="warranty-card-claims">
                <h3>Total Claims</h3>
                <span className="card-number">{totalClaims}</span>
                <p>{submittedThisMonth} submitted this month</p>
                <FaFileAlt className="card-icon" />
              </div>

              <div className="warranty-card-review">
                <h3>Under Review</h3>
                <span>{underReview}</span>
                <p>Awaiting tech inspection</p>
                <FaRegClock className="card-icon" />
              </div>

              <div className="warranty-card-repair">
                <h3>In Service/Repair</h3>
                <span>{InService}</span>
                <p>At service center</p>
                <FaRegEdit className="card-icon" />
              </div>
              <div className="warranty-card-resolved">
                <h3>Resolved & Replaced</h3>
                <span>{Resolved}</span>
                <p>100% claim satisfaction</p>
                <FaRegCheckCircle className="card-icon" />
              </div>
            </div>

            {/* Warranty claim history section */}
            <div className="warranty-history">
              {/* Status filters */}
              <div className="warranty-history-toolbar">
                <h2>Warranty Claim History</h2>

                <div className="warranty-filters">
                  <button
                    className={`filter-btn
                  ${activeFilter === "ALL" ? "active" : ""}`}
                    onClick={() => {
                      setActiveFilter("ALL");
                      setCurrentPage(1);
                    }}
                  >
                    {" "}
                    All ({claims.length})
                  </button>
                  <button
                    className={`filter-btn
                  ${activeFilter === "Under Review" ? "active" : ""}`}
                    onClick={() => {
                      setActiveFilter("Under Review");
                      setCurrentPage(1);
                    }}
                  >
                    Under Review ({underReview})
                  </button>
                  <button
                    className={`filter-btn ${activeFilter === "Approved" ? "active" : ""}`}
                    onClick={() => {
                      setActiveFilter("Approved");
                      setCurrentPage(1);
                    }}
                  >
                    Approved (
                    {
                      claims.filter((claim) => claim.status === "approved")
                        .length
                    }
                    )
                  </button>
                  <button
                    className={`filter-btn ${activeFilter === "Resolved" ? "active" : ""}`}
                    onClick={() => {
                      setActiveFilter("Resolved");
                      setCurrentPage(1);
                    }}
                  >
                    Resolved (
                    {
                      claims.filter((claim) => claim.status === "resolved")
                        .length
                    }
                    )
                  </button>
                </div>
              </div>

              {/* Warranty History Cards*/}
              <div className="warranty-history-filter">
                <h3>DATE</h3>
                <h3>TICKET NUMBER</h3>
                <h3>ITEM & SERIAL NO</h3>
                <h3>STATUS</h3>
                <h3>ACTION</h3>
              </div>
              {/* Loading and error messages */}
              {loadingClaims && <p>Loading Warranty Claims...</p>}
              {claimsError && <p>{claimsError}</p>}
              {!loadingClaims &&
                !claimsError &&
                (currentClaims.length === 0 ? (
                  <div className="no-claims">
                    {activeFilter === "ALL" && "No warranty claims found."}

                    {activeFilter === "Under Review" &&
                      "No warranty claims are currently under review."}

                    {activeFilter === "Approved" &&
                      "No approved warranty claims available yet."}

                    {activeFilter === "Resolved" &&
                      "No resolved warranty claims found yet."}
                  </div>
                ) : (
                  currentClaims.map((claim) => {
                    const status = normalizeStatus(claim.status);
                    return (
                      <div className="warranty-history-row" key={claim.id}>
                        <div className="history-date">
                          {new Date(claim.created_at).toLocaleDateString(
                            "en-IN",
                          )}
                        </div>

                        <div className="history-ticket">{claim.ticket_id}</div>

                        <div className="history-item">
                          <p>{claim.details?.[0]?.part_number || "-"}</p>
                          <span>
                            Invoice: {claim.details?.[0]?.invoice_no || "-"}
                          </span>
                        </div>
                        {/* Claim status */}

                        <div className="history-status">
                          <span
                            className={`history-status-text ${
                              status.includes("pending for courier")
                                ? "status-pending-courier"
                                : status === "pending"
                                  ? "status-review"
                                  : status === "approved"
                                    ? "status-dispatched"
                                    : status === "in service center"
                                      ? "status-service"
                                      : status === "resolved" ||
                                          status === "completed"
                                        ? "status-resolved"
                                        : ""
                            }`}
                          >
                            {status === "resolved"
                              ? "Claim Resolved"
                              : claim.status}
                          </span>
                        </div>
                        <div className="history-action">
                          {/*UPLOAD cOURIER INFORMATION WHEN CLAIM IS PENDING */}

                          {claim.corrier_info ? (
                            <button
                              type="button"
                              className="view-details"
                              onClick={() => handleViewDetails(claim.ticket_id)}
                            >
                              View Details
                            </button>
                          ) : (
                            status.includes("pending") && (
                              <FaCloudUploadAlt
                                className="upload-icon"
                                title="Upload Courier Information"
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  setIsCourierPopUpOpen(true);
                                }}
                              />
                            )
                          )}
                          {status === "in service center" && (
                            <button
                              type="button"
                              className="view-details"
                              onClick={() => handleViewDetails(claim.ticket_id)}
                            >
                              View Details
                            </button>
                          )}
                          {/* Download claim PDF */}
                          {claim.pdf_link && claim.pdf_link !== "#" && (
                            <a
                              href={claim.pdf_link}
                              target="_blank"
                              rel="noreferrer"
                              title="Download claim PDF"
                            >
                              <IoMdDownload className="download-icon" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                ))}

              {/*Pagination*/}
              <div className="warranty-pagination">
                <p>
                  {/* Showing{" "}
                  <strong>
                    {filteredClaims.length === 0 ? 0 : indexOfFirstClaim + 1}
                  </strong>{" "}
                  {""}to {""}
                  <strong>
                    {Math.min(indexOfLastClaim, filteredClaims.length)}{" "}
                  </strong>{" "}
                  {""} of {""}
                  <strong>{filteredClaims.length}</strong> claims */}
                  Showing <strong>{filteredClaims.length}</strong> of{" "}
                  <strong>{filteredClaims.length}</strong> claims
                </p>

                <div className="pagination-buttons">
                  <button
                    className="page-btn"
                    disabled={currentPage == 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;

                    return (
                      <button
                        key={pageNumber}
                        className={`page-btn ${
                          currentPage === pageNumber ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  <button
                    className="page-btn"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/*PopUp 1 : GSTIN USER DETAILS*/}

            {isModalOpen && !isExistingWarrantyUser && (
              <div className="wc-modal-overlay">
                <div className="wc-modal wc-gstin-modal">
                  <div className="wc-modal-top-line"></div>

                  <div className="wc-modal-header">
                    <h2>Enter Your Details</h2>
                    <button
                      type="button"
                      className="wc-close"
                      onClick={closeModals}
                      aria-label="Close"
                    >
                      X
                    </button>
                  </div>
                  <form onSubmit={goToKyc}>
                    <div className="wc-modal-body">
                      {/* Account type selection */}
                      <label className="wc-label">ACCOUNT TYPE</label>
                      <div className="wc-account-options">
                        <label
                          className={`wc-account-option ${
                            FormData.accountType === "Sub-Dealer"
                              ? "selected"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="accountType"
                            value="Sub-Dealer"
                            checked={FormData.accountType === "Sub-Dealer"}
                            onChange={updateField}
                          />
                          <span>Sub Dealer</span>
                          {/* {FormData.accountType === "Sub-Dealer" && (
                        <span className="wc-selected-check"> Tick</span>
                        
                      )} */}
                          {FormData.accountType === "Sub-Dealer" && (
                            <span className="wc-active-badge">ACTIVE</span>
                          )}
                        </label>

                        <label
                          className={`wc-account-option ${
                            FormData.accountType === "End User"
                              ? "selected"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="accountType"
                            value="End User"
                            checked={FormData.accountType === "End User"}
                            onChange={updateField}
                          />
                          <span>End User</span>
                          {FormData.accountType === "End User" && (
                            <span className="wc-active-badge">ACTIVE</span>
                          )}
                        </label>
                      </div>
                      {/* GSTIN input and verification */}
                      {!noGstin && (
                        <div className="wc-gstin-group">
                          <div className="wc-gstin-label-row">
                            <label htmlFor="wc-gstin">
                              GSTIN <span>*</span>
                            </label>
                            {/* <button type="button" className="wc-verify-btn">
                          Verify Portal
                        </button> */}
                          </div>

                          <div className="wc-gstin-input-wrap">
                            <input
                              type="text"
                              name="gstin"
                              id="wc-gstin"
                              placeholder="Enter GSTIN"
                              value={FormData.gstin}
                              className={`wc-gstin-input ${
                                gstinAlreadyExists
                                  ? "gstin-error"
                                  : gstinVerified
                                    ? "gstin-success"
                                    : ""
                              }`}
                              onChange={(e) => {
                                updateField(e);
                                setGstInVerified(false);
                                setGstinAlreadyExists(false);
                              }}
                              maxLength={15}
                              style={{ textTransform: "uppercase" }}
                              required={!noGstin}
                            />

                            <button
                              type="button"
                              className="wc-autofill-btn"
                              onClick={handleGstinVerify}
                              disabled={isGstinVerifying}
                            >
                              {isGstinVerifying ? "Verifying..." : "Verify"}
                            </button>
                          </div>
                          {/* GSTIN Success Message */}
                          {gstinVerified && !gstinAlreadyExists && (
                            <p className="gstin-success-message">
                              GSTIN VERIFIED SUCCESSFULLY
                            </p>
                          )}

                          {/* Duplicate GSTIN Error Message */}
                          {gstinAlreadyExists && (
                            <p className="gstin-error-message">
                              This GSTIN already exists. Please use another
                              GSTIN.
                            </p>
                          )}
                        </div>
                      )}
                      {/* OTP-verified mobile number */}
                      <div className="wc-form-field">
                        <label htmlFor="wc-mobile">
                          Mobile Number <span>*</span>
                        </label>
                        <div className="wc-input-with-icon">
                          <input
                            type="tel"
                            name="mobile"
                            id="wc-mobile"
                            placeholder="Enter mobile number"
                            value={FormData.mobile}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");

                              if (value.length <= 10) {
                                setFormData((prev) => ({
                                  ...prev,
                                  mobile: value,
                                }));
                              }
                            }}
                            maxLength={10}
                            inputMode="numeric"
                            pattern="[0-9]{10}"
                            required
                            readOnly
                          />
                        </div>
                      </div>
                      {/* Email address */}
                      <div className="wc-form-field">
                        <label htmlFor="wc-email">
                          Email Address <span>*</span>
                        </label>
                        <div className="wc-input-with-icon">
                          <input
                            type="email"
                            name="email"
                            id="wc-email"
                            placeholder="Enter email address"
                            value={FormData.email}
                            onChange={updateField}
                            required
                          />
                        </div>
                      </div>
                      {/* Option for users without GSTIN */}
                      <label className="wc-no-gstin-option">
                        <input
                          type="checkbox"
                          checked={noGstin}
                          onChange={(e) => {
                            const checked = e.target.checked;

                            setNoGstIn(checked);

                            setFormData((prev) => ({
                              ...prev,
                              declaration: checked,
                            }));
                          }}
                        />
                        <span className="wc-no-gstin-copy">
                          <strong>Don't have a GSTIN</strong>
                        </span>
                        <small>
                          Check this to enter individual address details,
                          company title Aadhar number.
                        </small>
                      </label>
                    </div>
                    {/* First popup buttons */}
                    <div className="wc-modal-footer">
                      <button
                        type="button"
                        onClick={closeModals}
                        className="wc-btn wc-btn-cancel"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className={`wc-btn wc-btn-primary ${
                          gstinAlreadyExists || (!noGstin && !gstinVerified)
                            ? "wc-btn-disabled"
                            : ""
                        }`}
                        disabled={
                          gstinAlreadyExists || (!noGstin && !gstinVerified)
                        }
                      >
                        Next
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/*POPUP-2 KYC DETAILS*/}

            {isKycOpen && (
              <div className="wc-modal-overlay">
                <div className="wc-modal wc-kyc-modal">
                  <div className="wc-modal-top-line"></div>

                  <div className="wc-modal-header">
                    <div className="wc-modal-header-content">
                      <h2>Enter Your Details</h2>
                      <p className="wc-modal-subtitle">
                        Non-GST Registered Commercial SubDealer Onboarding & KYC
                      </p>
                    </div>
                    <button
                      type="button"
                      className="wc-close"
                      onClick={closeModals}
                      aria-label="Close"
                    >
                      X
                    </button>
                  </div>
                  <form onSubmit={submitFrontendForm}>
                    <div className="wc-modal-body">
                      {/* Account classification */}
                      <div className="wc-form-field">
                        <label>Account Classification</label>
                        <div className="wc-account-classification">
                          {/* Sub Dealer */}
                          <label
                            className={`wc-account-option ${
                              FormData.accountType === "Sub-Dealer"
                                ? "selected"
                                : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="accountType"
                              value="Sub-Dealer"
                              checked={FormData.accountType === "Sub-Dealer"}
                              onChange={updateField}
                              required
                            />
                            <span>Sub Dealer</span>
                            {FormData.accountType === "Sub-Dealer" && (
                              <span className="wc-active-badge">ACTIVE</span>
                            )}
                            {/* End User */}
                          </label>

                          <label className="wc-account-option">
                            <input
                              type="radio"
                              name="accountType"
                              value="End User"
                              checked={FormData.accountType === "End User"}
                              onChange={updateField}
                              required
                            />
                            <span>End User</span>

                            {FormData.accountType === "End User" && (
                              <span className="wc-active-badge">ACTIVE</span>
                            )}
                          </label>
                        </div>
                      </div>

                      {/*Registered Mobile Number*/}

                      <div className="wc-form-field">
                        <label htmlFor="wc-mobile">
                          Registered Mobile Number <span>*</span>
                        </label>
                        <div className="wc-mobile-input">
                          <span className="wc-country-code">+91</span>

                          <input
                            type="tel"
                            id="wc-mobile"
                            name="mobile"
                            value={FormData.mobile}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");

                              if (value.length <= 10) {
                                setFormData((prev) => ({
                                  ...prev,
                                  mobile: value,
                                }));
                              }
                            }}
                            placeholder="Enter mobile number"
                            inputMode="numeric"
                            maxLength={10}
                            pattern="[0-9]{10}"
                            readOnly
                          />

                          <span className="wc-verified-badge">✓ Verified</span>
                        </div>
                      </div>

                      {/*Email Address*/}

                      <div className="wc-form-field">
                        <label htmlFor="wc-email">
                          Email Address <span>*</span>
                        </label>

                        <input
                          type="email"
                          id="wc-email"
                          name="email"
                          value={FormData.email}
                          onChange={updateField}
                          placeholder="Enter email address"
                          required
                        />
                      </div>

                      {/* Authorized Signatory /Full Name*/}

                      <div className="wc-form-field">
                        <label htmlFor="wc-fullname">
                          {" "}
                          Authorized Signature/Full Name <span>*</span>{" "}
                        </label>

                        <input
                          id="wc-fullname"
                          name="fullName"
                          value={FormData.fullName}
                          onChange={updateField}
                          placeholder="Enter Full Name"
                          required
                        />
                      </div>

                      <div className="wc-form-field">
                        <label htmlFor="wc-company">
                          Company/Trade Name <span>*</span>
                        </label>

                        <input
                          type="text"
                          id="wc-company"
                          name="companyName"
                          value={FormData.companyName}
                          onChange={updateField}
                          placeholder="Enter Company Name"
                          required
                        />
                      </div>

                      {/*Aadhar Card*/}
                      <div className="wc-form-field">
                        <label htmlFor="wc-aadhaar">
                          Aadhaar Number (For Identification) <span>*</span>
                        </label>
                        <input
                          type="text"
                          id="wc-aadhaar"
                          name="aadhaar"
                          value={FormData.aadhaar}
                          placeholder="Enter 12-Digit Aadhaar Number"
                          inputMode="numeric"
                          maxLength={12}
                          pattern="[0-9]{12}"
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");

                            if (value.length <= 12) {
                              setFormData((prev) => ({
                                ...prev,
                                aadhaar: value,
                              }));
                            }
                          }}
                          disabled={!noGstin}
                        />
                      </div>

                      {/* Trade Address Line 1 */}
                      <div className="wc-form-field">
                        <label htmlFor="wc-address1">
                          Trade Address (Line 1) <span>*</span>
                        </label>

                        <input
                          type="text"
                          name="address1"
                          id="wc-address1"
                          placeholder="Enter trade address"
                          value={FormData.address1}
                          onChange={updateField}
                          required
                        />
                      </div>

                      {/* Trade Address 2 */}
                      <div className="wc-form-field">
                        <label htmlFor="wc-address2">
                          {" "}
                          Address Line 2 (Optional)
                        </label>

                        <input
                          type="text"
                          name="address2"
                          id="wc-address2"
                          placeholder="Enter Additional Address"
                          value={FormData.address2}
                          onChange={updateField}
                        />
                      </div>
                      {/* State dropdown */}
                      <div className="wc-form-field">
                        <label htmlFor="wc-state">State *</label>
                        <select
                          name="state"
                          id="wc-state"
                          value={FormData.state}
                          onChange={updateField}
                          required
                        >
                          <option value="">
                            {isLoadingStates
                              ? "Loading states..."
                              : "Select State"}
                          </option>

                          {states.map((state) => (
                            <option key={state.id} value={state.name}>
                              {state.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="wc-form-row">
                        <div className="wc-form-field">
                          <label htmlFor="wc-city">
                            City/District <span>*</span>
                          </label>

                          <input
                            type="text"
                            name="city"
                            id="wc-city"
                            placeholder="Enter City or District"
                            value={FormData.city}
                            onChange={updateField}
                            required
                          />
                        </div>

                        <div className="wc-form-field">
                          <label htmlFor="wc-pincode">
                            Pincode
                            <span>*</span>
                          </label>

                          <input
                            type="text"
                            inputMode="numeric"
                            name="pincode"
                            id="wc-pincode"
                            placeholder="Enter 6 digit pincode"
                            value={FormData.pincode}
                            onChange={updateField}
                            maxLength={6}
                            pattern="[0-9]{6}"
                            required
                          />
                        </div>
                      </div>

                      {/* No GSTIN Decleration */}
                      <label className="wc-no-gstin-option">
                        <input
                          type="checkbox"
                          name="declaration"
                          checked={noGstin}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setNoGstIn(checked);
                            setGstinAlreadyExists(false);
                            setGstInVerified(false);
                            setFormData((prev) => ({
                              ...prev,
                              declaration: checked,
                            }));
                          }}
                          required={noGstin}
                        />
                        <span>
                          <strong>Don't have a GSTIN</strong>
                          <small>
                            I certify that my annual turnover is below the
                            mandatory GST threshold
                          </small>
                        </span>
                      </label>
                    </div>

                    <div className="wc-modal-footer">
                      <button
                        type="button"
                        className="wc-btn wc-btn-cancel"
                        onClick={goBackToDetails}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="wc-btn wc-btn-primary"
                        disabled={isSubmitting}
                      >
                        Next
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {isCourierPopUpOpen && (
              <CourierPopUp
                onClose={() => setIsCourierPopUpOpen(false)}
                claim={selectedClaim}
                onSuccess={fetchClaims}
              />
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default WarrantyClaim;
