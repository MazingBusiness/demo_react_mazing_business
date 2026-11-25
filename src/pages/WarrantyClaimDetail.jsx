import React, { useState , useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import { FaTruckLoading } from 'react-icons/fa'
import { FaWarehouse } from "react-icons/fa";
import { CiReceipt } from "react-icons/ci";
import { MdOutlineVerified } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";
import { FaTruck } from "react-icons/fa";
import { FaBarcode } from "react-icons/fa";
import { FaQuestionCircle } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa6";
import { FaAddressCard } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { FaClock } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { FaBox } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import { useLocation, useParams } from 'react-router-dom';
import { getWarrantyDetails } from '../api/apiRequest';
import MainLayout from '../layouts/MainLayout';
import { useLoading } from '../context/LoadingContext';
import GlobalLoader from '../layouts/GlobalLoader';
import { downloadShippingLabel } from '../api/apiRequest';
const WarrantyClaimDetail = () => {
const location=useLocation();

const[warrantyDetail,setWarrantyDetail]=useState(null);
const[loading,setLoading]=useState(true);
const[error,setError]=useState("");
const{ticketId}=useParams();
const {startLoading,stopLoading}=useLoading();
const[apiError,setApiError]=useState("");
const warrantyDetails = location.state?.warrantyDetails;
const navigate=useNavigate();
console.log("Ticket ID:", ticketId);
console.log("Warranty Details:", warrantyDetail);

//Format Date

  const formatDate = (date) => {
    if (!date) return "-";
     return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
}

 // Format date and time
  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };
const fetchWarrantyDetails= async(ticketId)=>{// it receives the ticketId as input 
try{
    setLoading(true);
    setError("");
    startLoading();
const response=await getWarrantyDetails
(ticketId);
if(!response.ok){
throw new Error("Failed to fetch warranty details")
}
const result=await response.json();

if(!result || result.res===false){
    throw new Error(result?.msg ||"failed to fetch details.")
}
setWarrantyDetail(result.data);
}
catch(error){
console.error("Error fetching Warranty Details",error);
setError(error.message);
setApiError(error.message || "Unable to Fetch Warranty Details")
}
finally{
setLoading(false);
stopLoading();
}
}

useEffect(()=>{
fetchWarrantyDetails(ticketId);
},[ticketId]);

const claim=warrantyDetail?.claim;
const details=warrantyDetail?.details||[];
const warehouse=warrantyDetail?.warehouse;
const getApprovalStatus = (status) => {
  switch (Number(status)) {
    case 1:
      return "Approved";
    case 2:
      return "Rejected";
    default:
      return "Pending";
  }
};
const getApprovalClass = (status) => {
  switch (String(status)) {
    case "1":
      return "approval-approved";
    case "2":
      return "approval-rejected";
    default:
      return "approval-pending";
  }
};


const handleShippingLabelDownload=async()=>{
try{
if(!claim?.ticket_id){
throw new Error("Ticket ID not available");
}

// Call Shipping PDF API FOR DOWNLOADING
const response=await downloadShippingLabel(claim.ticket_id);
const result=await response.json();

  console.log("SHIPPING PDF RESPONSE:", result);

    if (!response.ok || result.res !== true) {
      throw new Error(result.msg || "Shipping label generation failed.");
    }

 const pdfUrl = result.data?.pdf_url;

    if (!pdfUrl) {
      throw new Error("PDF URL not received");
    }

    window.open(pdfUrl, "_blank");


// // Trigger PDF download

// const link=document.createElement("a");// Create an anchor element means a download url
// link.href=downloadUrl;// href=downloadUrl
// link.download=fileName;

// document.body.appendChild(link);
// link.click();
// document.body.removeChild(link);

}catch(error){
console.error("Shipping Label Download Error:",error);
alert(error.message || "Unable to download shipping label.");
}
}
  return (
<MainLayout>
 <div className='warranty-claim-detail-page'>
<GlobalLoader section show={loading}/>
{apiError ? (
          <div className="warranty-api-error">
        <h3>Unable to Load Warranty Details</h3>
        <p>{apiError}</p>
        <button onClick={()=>
        window.location.reload()}>
          Try Again
        </button>
        </div>
        ):(
<div style={{visibility:loading?"hidden":"visible"}}>
<div className='warranty-claim-page-header'>
    <button
    type='button'
    className='back-to-claims'
    onClick={()=>  navigate('/warranty-claim')}
    >
<FaArrowLeft />
Back to Claims
    </button>
    <div className='claim-header-content'>
        <div>
<h2>Warranty Claim - <span>{claim?.ticket_id}</span></h2>
<p className='claim-status'>
    <FaClock/>
    {claim?.status}</p>
<small className='claim-created'>
    <FaCalendarAlt />
    Created on: {formatDateTime(claim?.created_at)}</small>
</div>

<div className='claim-header-actions'>

    <button type='button' className='shipping-label-btn'
    disabled={!claim?.ticket_id}
    onClick={handleShippingLabelDownload}
    >
        <FaFilePdf/>
        Shipping Label
    </button>
</div>
</div>
</div>




{/* Dispatch & Consignment Details */}
<section className='dispatch-consignment-details'>
    <div className='dispatch-consignment-details-heading'> <FaTruckLoading className='truck-unloading-icon'/>
  <h2>Dispatch & Consignment Details</h2>

  <div className='dispatch-status'>
    <span><GoDotFill/> 
     {claim?.corrier_info ? "Courier Uploaded" :"Awaiting Courier Details"}
     </span>

    <span>{details.length} Package Items</span>
    </div>
    </div>
{/* SHIP FROM*/}
    <div className='dispatch-consignment-box'>
        <div className='ship-form-box'>
        <div className='ship-details'>
    <FaWarehouse className='warehouse-icon'/>
<h3>SHIP FROM </h3>
<span>({claim?.name || "-"})</span>
</div>
<h3>{claim?.name || "-"}</h3>
<p>  {claim?.address || "-"}
<br />
  {claim?.address_2 || ""}
        <br />
        {claim?.city || "-"} - {claim?.postal_code || "-"}
</p>

<div className='gmail-details'>
<p>
  Phone: {claim?.phone || "-"}
</p>
<p>Email: {claim?.email || "-"}</p>
</div>
</div>

<div className='courier-receipt-details'>
    <div className='receipt-heading'>
<CiReceipt/>
<h3>Courier Receipt / Waybill</h3>
    <div className='receipt-status'>
        {claim?.corrier_info?(
            <>
    <MdOutlineVerified/>
    <span>(Stored & Verified)</span>
    </>
        ):(
            <span>Not Uploaded</span>
        )}
</div>

{claim?.corrier_info ?(
    <a href={claim?.corrier_info} target='_blank'
    rel='noreferrer' className='receipt-view-btn'>
<FaEye/>
View/Download
</a>
):(
    <button type='button' className='receipt-view-btn' disabled>
    <FaEye/>
    Not Available
    </button>
)}
</div>
</div>

{/* Ship To */}
<div className='ship-details-box'>
    <div className='ship-details-header'>
<FaLocationDot/>
<h3>SHIP TO</h3>
<small>(ACE Tools Private Limited)</small>
</div>

<h3>ACE Tools Private Limited</h3>
<p>
     {warrantyDetail?.warehouse?.address || "-"}
        <br />
        {warrantyDetail?.warehouse?.city_name || warrantyDetail?.warehouse?.name || "-"}
<br />
{warrantyDetail?.warehouse?.pincode || "-"}
        </p>
         <p>
            {warrantyDetail?.warehouse?.phone || "-"}
          </p>
</div>

{/* DELIVERY SLA */}
<div className='delivery-sla'>

    <div className='delivery-sla-heading'>
        <h3>DELIVERY SLA</h3>
        </div>
        <div className='courier-provider'>
        <FaTruck/>
    <strong>{claim?.courier_name||"Courier not assigned"}</strong>
    </div>

 <div>
              <p>Tracking Number</p>
              <span className='transit-time'>{claim?.tracking_no || "-"}</span>
            </div>
    {/* <div className='transit-time'>
    <p>Est.Transit Time</p>
    <strong>Not Available</strong>
</div> */}
</div>
</div>
</section>

{/* Products & Defective Parts Claimed */}
<section className='claimed-details'>
    <div className='claimed-details-header'>

<div className='claimed-title'>
<FaBox/>
<h3>Products & Defective Parts Claimed</h3>
<span>{details.length} Items</span>
    </div>
    <small>Total Items: {details.length}</small>
    </div>



<div className='claimed-table-wrapper'>

<table className='claimed-products-table'>
    <thead>
        <tr>{/* Create a horizontal table row*/}
<th>#</th>{/* Create a title inside each row */}
<th>Barcode & Serial</th>
<th>MAIN PART NO.</th>
<th>INVOICE NO.</th>
<th>PURCHASE DATE.</th>
<th>WARRANTY PART NO.</th>
<th>WARRANTY PRODUCT NAME</th>
<th>INVOICE FILE</th>
<th>WARRANTY CARD</th>
<th>APPROVAL</th>
</tr>
</thead>
<tbody>
        {details.length>0?(
details.map((item,index)=>(
    <tr key={item.id}>
<td>{String(index+1).padStart(2,"0")}</td>
<td>
<div className='barcode-cell'>
<FaBarcode/>
<strong>{item.barcode||"-"}</strong>
</div>
<small>standard 1D Code 128 Matched</small>
</td>
<td>
<strong>
{item.part_number||"-"}
    </strong>
    </td>
{/* INVOICE NUMBER*/}
    <td>
<div className='invoice-cell'>
    <h3>{item.invoice_no||"-"} </h3>
    <FaQuestionCircle title='Invoice-Details'/>
    </div>
    </td>
    <td>{formatDate(item.purchase_date)}</td>
{/* Warranty Part Number*/}
<td><strong>{item.warranty_product_part_number||"-"}</strong></td>

<td>
<div className='product-name-cell'>
    <FaBox/>
    <div>
<strong>
    {item.warranty_product?.name || item.product?.name||"-"}

</strong>
<small>CATEGORY: {item.product?.category||"-"}</small>
</div>
</div>
</td>
{/* INVOICE FILE*/}
<td>
    {item.attachment_invoice ?(
<a
href={item.attachment_invoice}
target='_blank'
rel='noreferrer'
className='view-document-btn'
>

<FaFilePdf />
View
</a>
    ):(
    <button type='button' className='view-document-btn' disabled>
    <FaFilePdf/>
    View
</button>
    )}
</td>

<td>
    {item.attatchment_warranty_card ? (
<a
href={item.attatchment_warranty_card}
target='_blank'
rel='noreferrer'
className='view-document-btn'
>

<FaAddressCard />
View
</a>
    ):(
<button
type='button'
className='view-document-btn'
>

<FaAddressCard />
View
</button>
    )}
</td>

<td>
    <span className={`approval-status ${getApprovalClass(item.approval_status)}`}>
<GoDotFill />
 {getApprovalStatus(item.approval_status)}
</span>
</td>
</tr>
))
        ):(
                <tr>
                  <td colSpan="10">
                    No claimed products found.
                  </td>
                </tr>

              )}

</tbody>
</table>
</div>


<div className='claimed-table-footer'>
<p>  Showing {details.length > 0 ? details.length : 0} to {details.length} claimed components</p>
</div>
</section>
</div>
        )}
</div>
</MainLayout>
  )
}

export default WarrantyClaimDetail
