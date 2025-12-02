import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";

import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, Link } from "react-router-dom";
import InvoiceBtn from "../assets/icons/ShippingLabel.svg";
import ViewdBtn from "../assets/icons/viewd.svg";

import { FiEye } from "react-icons/fi";

const WarrentyClaimFull = () => {
  return (
    <MainLayout>
      <div className="maincontainer">
        <div className="order-details">
          <div className="orderdetailsHr">
            <div className="orderdetailsHrLft">
              <div className="breadcrumb">
                <Link to="/NewWarrentyClaim">
                  <IoIosArrowBack />
                  Back
                </Link>
              </div>
            </div>

            <div
              className="orderdetailsHrRgt"
              style={{ flexDirection: "column" }}
            >
              <span className="Sended status approved">
                Sended to warehouse
              </span>
              <button className="invoice-btn">
                <img src={InvoiceBtn} alt="User" />
              </button>
            </div>
          </div>

          <div className="orderdetailsHr">
            <div className="orderdetailsHrLft">
              <h5>
                Warranty Claim — <Link>MZW00000001</Link>
              </h5>
              <label>
                <strong>Created:</strong> 18 Sep 2025, 03:33 PM
              </label>
            </div>
          </div>

          <div className="order-info-grid">
            <div className="order-info-gridLft">
              <div className="order-box">
                <h4>Ship From</h4>
                <div className="order-box-inner">
                  <p>
                    <strong>Address:</strong> Plot No. 123, Lane-4, Jayadev
                    Vihar, Bhubaneswar - 751013, Khordha District, Odisha, India
                  </p>
                  <p>
                    <strong>Aadhar:</strong> 2147483647
                  </p>
                  <p>
                    <strong>Email:</strong> demo@gmail.com
                  </p>

                  <p>
                    <strong>Phone:</strong> +91 9804722028
                  </p>

                  <p className="lastdown">
                    <strong>Courier File:</strong>{" "}
                    <button className="invoice-btn">
                      <img src={ViewdBtn} alt="User" />
                    </button>{" "}
                    (stored)
                  </p>
                </div>
              </div>
            </div>

            <div className="order-info-gridRgt">
              <div className="order-box">
                <h4>Ship To</h4>
                <div className="order-box-inner">
                  <p>
                    <strong>Address:</strong> Plot No. 123, Lane-4, Jayadev
                    Vihar, Bhubaneswar - 751013, Khordha District, Odisha, India
                  </p>
                  <p>
                    <strong>Aadhar:</strong> 2147483647
                  </p>
                  <p>
                    <strong>Email:</strong> demo@gmail.com
                  </p>

                  <p>
                    <strong>Phone:</strong> +91 9804722028
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-section order-sectionW">
            <h3>Order Details</h3>
            <table className="order-table">
              <thead>
                <tr>
                  <th>SL No</th>
                  <th>Barcode</th>
                  <th>Main Part No.</th>
                  <th>Invoice</th>
                  <th>Purchase Date</th>
                  <th>Warranty Part No.</th>
                  <th>Warranty Product Name</th>
                  <th>Invoice File</th>
                  <th>Warranty Card</th>
                  <th>Approval</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="SL No">01</td>
                  <td data-label="Barcode">MZ3288600001B6132543384</td>
                  <td data-label="Main Part No.">MZ11018</td>
                  <td data-label="Invoice">MUM-008</td>
                  <td data-label="Purchase Date">05-09-2025</td>
                  <td data-label="Warranty Part No.">MZ32913</td>
                  <td data-label="Warranty Product Name">
                    OPEL SELECT 5232 - ARMATURE
                  </td>
                  <td data-label="Invoice File"></td>
                  <td data-label="Warranty Card">
                    <button className="tblViewBtn">
                      <FiEye color="#004b87" /> View
                    </button>
                  </td>
                  <td data-label="Approval">
                    <span className="status approved">Approved</span>
                  </td>
                </tr>

                <tr>
                  <td data-label="SL No">01</td>
                  <td data-label="Barcode">MZ3288600001B6132543384</td>
                  <td data-label="Main Part No.">MZ11018</td>
                  <td data-label="Invoice">MUM-008</td>
                  <td data-label="Purchase Date">05-09-2025</td>
                  <td data-label="Warranty Part No.">MZ32913</td>
                  <td data-label="Warranty Product Name">
                    OPEL SELECT 5232 - ARMATURE
                  </td>
                  <td data-label="Invoice File"></td>
                  <td data-label="Warranty Card">
                    <button className="tblViewBtn">
                      <FiEye color="#004b87" /> View
                    </button>
                  </td>
                  <td data-label="Approval">
                    <span className="status pending">Pending</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default WarrentyClaimFull;
