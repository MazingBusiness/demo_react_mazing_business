import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import no_image from "../assets/images/no-image.png";
import fastDeliveryIcon from "../assets/icons/fast-delivery.svg";
import CartIcon from "../assets/icons/CartIcon.svg";
import warrantyIcon from "../assets/icons/warranty.jpeg";

import ProductModal from "./ProductModal.jsx";
import {
  getQuickOrderProduct,
  generatePdfFileName,
  getPdfQuickOrderProduct,
  generateExcelFileName,
  getExcelQuickOrderProduct,
} from "../api/apiRequest.jsx";
import { getLoggedInUser } from "../utils/authUtils.js";

const QuickOrderGrid = ({ filters, onPriceRangeUpdate }) => {
  const navigate = useNavigate();
  const loaderRef = useRef(null);
  const user = getLoggedInUser();

  const [totalRecord, setTotalRecord] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 16;
  const [hasMore, setHasMore] = useState(true);

  const [price_sort, setPriceSort] = useState("popularity");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const openModal = (product) => setSelectedProduct(product);
  const closeModal = () => setSelectedProduct(null);

  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [excelDownloading, setExcelDownloading] = useState(false);

  const handleSortChange = (value) => {
    setPriceSort(value);
    setCurrentPage(1);
    setProducts([]);
    setHasMore(true);
  };

  const toCsv = (value) => {
    if (Array.isArray(value)) return value.join(",");
    return value ?? "";
  };

  const triggerBrowserDownload = (downloadUrl, finalFileName) => {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", finalFileName);
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getQuickOrderProductRecord = async (page = 1) => {
    try {
      setLoading(true);

      const apiRes = await getQuickOrderProduct(
        filters?.cat_groups || [],
        filters?.categories || [],
        filters?.brands || [],
        filters?.search_text || "",
        filters?.min_price || "",
        filters?.max_price || "",
        filters?.location_id || "",
        filters?.inhouse_product || "",
        price_sort,
        filters?.delivery ?? "",
        page
      );

      const responseData = await apiRes.json();

      if (responseData?.res) {
        const productList = responseData?.data?.data || [];
        const total = responseData?.data?.total || 0;

        setTotalRecord(total);

        if (onPriceRangeUpdate) {
          onPriceRangeUpdate({
            min: responseData?.min_mrp,
            max: responseData?.max_mrp,
          });
        }

        const transformedData = productList.map((item) => {
          const noCredit = item.cash_and_carry_item === 1;
          const fastDeliveryTag = item.fast_delivery_tag === 1;
          const hasWarranty = item.is_warranty === 1;

          const rating = item.rating && item.rating !== 0 ? item.rating : 4;
          const totalRatings =
            Array.isArray(item.reviews) && item.reviews.length > 0
              ? item.reviews.length
              : 20;

          const offerList = Array.isArray(item.offer) ? item.offer : [];
          const now = new Date();

          const hasActiveOffer = offerList.some((offerItem) => {
            const start = offerItem?.offer_validity_start
              ? new Date(offerItem.offer_validity_start.replace(" ", "T"))
              : null;

            const end = offerItem?.offer_validity_end
              ? new Date(offerItem.offer_validity_end.replace(" ", "T"))
              : null;

            if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
              return false;
            }

            return now >= start && now <= end;
          });

          return {
            id: item.id,
            slug: item.slug,
            name: item.name,
            img: item.thumb_img?.file_name || no_image,
            oldPrice: item.mrp ? `₹${parseFloat(item.mrp).toFixed(2)}` : "₹0.00",
            newPrice: item.discount_price
              ? `₹${parseFloat(
                  String(item.discount_price).replace(/₹/g, "")
                ).toFixed(2)}`
              : "₹0.00",
            rating,
            totalRatings,
            sold: `${Math.floor(Math.random() * 50 + 1)}/${Math.floor(
              Math.random() * 200 + 50
            )}`,
            fastDeliveryTag,
            is_warranty: hasWarranty,
            noCredit,
            cash_and_carry_item: Number(item.cash_and_carry_item || 0),
            offer: offerList,
            hasActiveOffer,
            discount: item.discount ? `${item.discount}%` : "20%",
            user_id: user?.id || null,
            category_group: item.category_group?.name || "",
            category: item.category?.name || "",
            fast_delivery_tag: item.fast_delivery_tag,
            stocks: item.stocks || [],
            reviews: item.reviews || [],
          };
        });

        setProducts((prev) =>
          page === 1 ? transformedData : [...prev, ...transformedData]
        );

        const computedTotalPages = Math.ceil(total / productsPerPage) || 1;
        setHasMore(page < computedTotalPages);
      } else {
        if (page === 1) {
          setProducts([]);
          setTotalRecord(0);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      if (page === 1) {
        setProducts([]);
        setTotalRecord(0);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setPdfDownloading(true);

      const slug = "quick-order-products";
      const fileRes = await generatePdfFileName(slug);

      if (!fileRes?.res || !fileRes?.file_name) {
        alert(fileRes?.msg || "Unable to generate PDF file name.");
        return;
      }

      const file_name = fileRes.file_name;

      const pdfRes = await getPdfQuickOrderProduct(
        file_name,
        toCsv(filters?.cat_groups),
        toCsv(filters?.categories),
        toCsv(filters?.brands),
        filters?.search_text || "",
        filters?.min_price || "",
        filters?.max_price || "",
        filters?.location_id || "",
        filters?.inhouse_product || "",
        price_sort || "popularity",
        filters?.delivery ?? "",
        1,
        totalRecord || 1000
      );

      const pdfJson = await pdfRes.json();

      if (!pdfRes.ok || !pdfJson?.res || !pdfJson?.file_name) {
        alert(pdfJson?.msg || "PDF generation failed.");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const finalFileName = pdfJson.file_name;
      const downloadUrl = `${window.location.origin}/mazing_business_react/public/pdfs/${finalFileName}`;
      triggerBrowserDownload(downloadUrl, finalFileName);
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Something went wrong while downloading PDF.");
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setExcelDownloading(true);

      const fileRes = await generateExcelFileName();

      if (!fileRes?.res || !fileRes?.file_name) {
        alert(fileRes?.msg || "Unable to generate Excel file name.");
        return;
      }

      const file_name = fileRes.file_name;

      const excelRes = await getExcelQuickOrderProduct(
        file_name,
        toCsv(filters?.cat_groups),
        toCsv(filters?.categories),
        toCsv(filters?.brands),
        filters?.search_text || "",
        filters?.min_price || "",
        filters?.max_price || "",
        filters?.location_id || "",
        filters?.inhouse_product || "",
        price_sort || "popularity",
        filters?.delivery ?? "",
        1,
        totalRecord || 1000
      );

      const excelJson = await excelRes.json();

      if (!excelRes.ok || !excelJson?.res || !excelJson?.file_name) {
        alert(excelJson?.msg || "Excel generation failed.");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const finalFileName = excelJson.file_name;
      const downloadUrl = `https://mazingbusiness.com/mazing_business_react/storage/app/excel/${finalFileName}`;
      triggerBrowserDownload(downloadUrl, finalFileName);
    } catch (error) {
      console.error("Excel download failed:", error);
      alert("Something went wrong while downloading Excel.");
    } finally {
      setExcelDownloading(false);
    }
  };

  const fastDeliveryTag = (product) => {
    if (!product.fastDeliveryTag) return null;

    return (
      <div className="delivery">
        <img
          src={fastDeliveryIcon}
          alt="Fast Delivery"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>
    );
  };

  const renderWarrantyTag = (product) => {
    if (!product.is_warranty) return null;

    return (
      <div className="delivery">
        <img
          src={warrantyIcon}
          alt="Warranty"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>
    );
  };

  const renderProductImage = (product, onCartClick = () => {}) => {
    return (
      <div className="product-img">
        {product.img ? (
          <img
            src={product.img}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = no_image;
            }}
            onClick={(e) => {
              e.stopPropagation();
              onCartClick(product);
            }}
          />
        ) : (
          <div className="image-placeholder">
            <span>No Image</span>
            <img src={no_image} alt="No Image" loading="lazy" />
          </div>
        )}

        {product.user_id != null && (
          <>
            <div className="btnGrp">
              <button
                className="cart-btn"
                aria-label="Add to cart"
                onClick={(e) => {
                  e.stopPropagation();
                  onCartClick(product);
                }}
              >
                <img src={CartIcon} alt="CartIcon" /> Add to Cart
              </button>
            </div>

            {Number(product.cash_and_carry_item) === 1 && (
              <div className="no-credit-tag">No Credit Item</div>
            )}

            {product.hasActiveOffer && (
              <div className="offer-tag">Special Offer Item</div>
            )}
          </>
        )}
      </div>
    );
  };

  useEffect(() => {
    setCurrentPage(1);
    setProducts([]);
    setHasMore(true);
  }, [
    filters?.cat_groups,
    filters?.categories,
    filters?.brands,
    filters?.search_text,
    filters?.min_price,
    filters?.max_price,
    filters?.location_id,
    filters?.inhouse_product,
    filters?.delivery,
    price_sort,
  ]);

  useEffect(() => {
    getQuickOrderProductRecord(currentPage);
  }, [
    currentPage,
    filters?.cat_groups,
    filters?.categories,
    filters?.brands,
    filters?.search_text,
    filters?.min_price,
    filters?.max_price,
    filters?.location_id,
    filters?.inhouse_product,
    filters?.delivery,
    price_sort,
  ]);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <div className="product-section-wrapper">
      <div className="product-header">
        <div className="sort-by">
          {/*
          <span>Sort By:</span>
          <select
            value={price_sort}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="popularity">Popularity</option>
            <option value="low_to_high">Price: Low to High</option>
            <option value="high_to_low">Price: High to Low</option>
          </select>
          */}
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            className="download-pdf-btn"
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfDownloading}
          >
            {pdfDownloading ? "Downloading PDF..." : "Download Net Price (PDF)"}
          </button>

          <button
            className="download-excel-btn"
            type="button"
            onClick={handleDownloadExcel}
            disabled={excelDownloading}
          >
            {excelDownloading ? "Downloading Excel..." : "Download Net Price (EXCEL)"}
          </button>
        </div>
      </div>

      <div className="product-grid Quick-grid">
        {!loading && products.length === 0 && (
          <div className="no-products">No products found.</div>
        )}

        {products.map((product) => (
          <div key={product.id} className="product-box">
            <div className="product-card">
              {renderProductImage(product, openModal)}

              <div className="product-info">
                <h3 title={product.name}>
                  {product.name?.length > 65
                    ? product.name.substring(0, 85) + "..."
                    : product.name}
                </h3>

                {product.user_id != null && (
                  <div className="prices">
                    <span className="old">{product.oldPrice}</span>
                    <span className="new">{product.newPrice}</span>
                  </div>
                )}

                <div className="ratingGrp">
                  <div className="ratingGrpLft">{renderWarrantyTag(product)}</div>
                  {fastDeliveryTag(product)}
                </div>

                {product.user_id == null && (
                  <div>
                    <button
                      type="button"
                      className="before-reg-btn"
                      onClick={() => navigate("/register")}
                    >
                      Register to check prices
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div ref={loaderRef} style={{ height: 1 }} />

      {loading && (
        <div className="loader">
          {currentPage === 1 ? "Loading products…" : "Loading products…"}
        </div>
      )}

      {!hasMore && !loading && products.length > 0 && (
        <div className="no-more">You reached the end.</div>
      )}

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={closeModal}
      />
    </div>
  );
};

export default QuickOrderGrid;