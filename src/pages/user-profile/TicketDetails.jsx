import React from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, Link } from "react-router-dom";
import InvoiceBtn from "../../assets/icons/InvoiceBtn.svg";
import ProfileChat from "../../components/user-profile/ProfileChat";

const TicketDetails = () => {
  return (
    <UserProfileLayout>
      <div className="order-details">
        <div className="orderdetailsHr">
          <div className="orderdetailsHrLft">
            <div className="breadcrumb">
              <Link to="/profileSupportTicket">
                <IoIosArrowBack />
                Ticket Details
              </Link>
              / Ticket Id: <span>#10000003</span>
            </div>
          </div>
        </div>
        <div className="chat-section">
          <ProfileChat />
        </div>
      </div>
    </UserProfileLayout>
  );
};

export default TicketDetails;
