import React, { useEffect, useState } from "react";
import UserProfileLayout from "../../layouts/UserProfileLayout";
import ProductModal from "../../components/ProductModal";
import noImage from "../../assets/images/no-image.png";
import CartIcon from "../../assets/icons/CartIcon.svg";
import fastDeliveryIcon from "../../assets/icons/fast-delivery.svg";
import warrantyIcon from "../../assets/icons/warranty.jpeg";
import DeleteIcon from "../../assets/icons/Delete2.svg";
import Swal from "sweetalert2";
import { getWishList, removeFromWishlist } from "../../api/apiRequest";

const ProfileWishlist = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const showToast = (icon, title) => {
    Swal.fire({
      target: document.body,
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      customClass: {
        container: "swal-toast-container",
        popup: "swal-toast-popup",
      },
    });
  };

  const formatPrice = (value) => {
    const price = Number(String(value ?? 0).replace(/[^0-9.]/g, ""));
    return `₹${Number.isFinite(price) ? price.toFixed(2) : "0.00"}`;
  };

  const normalizeProduct = (wishlistItem) => {
    const item = wishlistItem?.product ?? wishlistItem;
    const discountPrice = Number(
      String(item?.discount_price ?? 0).replace(/[^0-9.]/g, "")
    );
    const mCoinRate = Number(item?.c_instock_m_coin || 0);

    return {
      ...item,
      id: item?.id ?? wishlistItem?.product_id,
      name: item?.name ?? "Product",
      img: item?.thumb_img?.file_name ?? item?.thumb_img ?? item?.image ?? noImage,
      oldPrice: formatPrice(item?.mrp),
      newPrice: formatPrice(item?.discount_price),
      earnMCoin: discountPrice * mCoinRate,
      fastDeliveryTag: Number(item?.fast_delivery_tag) === 1,
      is_warranty: Number(item?.is_warranty) === 1,
      wish_list_flag: 1,
    };
  };

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const response = await getWishList();
      const list = response?.data?.data
        ?? response?.data?.products
        ?? response?.data
        ?? response?.products
        ?? response?.wishlist
        ?? [];

      setProducts((Array.isArray(list) ? list : []).map(normalizeProduct));
    } catch (error) {
      setProducts([]);
      showToast("error", error?.message || "Unable to load wishlist products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  useEffect(() => {
    const handleWishlistUpdated = (event) => {
      const { productId, wish_list_flag } = event.detail || {};
      if (Number(wish_list_flag) === 0) {
        setProducts((current) => current.filter((item) => item.id !== productId));
      }
    };

    window.addEventListener("wishlist-updated", handleWishlistUpdated);
    return () => window.removeEventListener("wishlist-updated", handleWishlistUpdated);
  }, []);

  const handleRemove = async (event, product) => {
    event.stopPropagation();
    if (removingIds.includes(product.id)) return;

    const confirmation = await Swal.fire({
      title: "Are you sure you want to remove from your wishlist?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sure",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d70000",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    setRemovingIds((current) => [...current, product.id]);
    try {
      const response = await removeFromWishlist(product.id);
      if (response?.res === false) {
        showToast("error", response?.msg || response?.message || "Unable to remove product.");
        return;
      }

      setProducts((current) => current.filter((item) => item.id !== product.id));
      window.dispatchEvent(new CustomEvent("wishlist-updated", {
        detail: { productId: product.id, wish_list_flag: 0 },
      }));
      showToast("success", response?.msg || response?.message || "Product removed from wishlist.");
    } catch (error) {
      showToast("error", error?.message || "Unable to remove product.");
    } finally {
      setRemovingIds((current) => current.filter((id) => id !== product.id));
    }
  };

  return (
    <UserProfileLayout>
      <div className="wishlist-container">
        <div className="orderdetailsHr">
          <div className="orderdetailsHrLft">
            <h2>My Wishlist</h2>
          </div>
        </div>

        <div className="product-grid Quick-grid">
          {loading && <div className="loader">Loading products…</div>}

          {!loading && products.length === 0 && (
            <p className="Nofound">No wishlist items found.</p>
          )}

          {!loading && products.map((product) => (
            <div
              key={product.id}
              className="product-box"
              role="button"
              tabIndex={0}
              onClick={() => setSelectedProduct(product)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedProduct(product);
                }
              }}
            >
              <div className="product-card">
                <div className="product-img">
                  <img
                    src={product.img || noImage}
                    alt={product.name}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = noImage;
                    }}
                  />

                  <button
                    type="button"
                    className="quick-wishlist-btn wishlist-delete-btn"
                    aria-label="Remove from wishlist"
                    disabled={removingIds.includes(product.id)}
                    onClick={(event) => handleRemove(event, product)}
                  >
                    <img src={DeleteIcon} alt="" aria-hidden="true" />
                  </button>

                  <div className="btnGrp">
                    <button
                      type="button"
                      className="cart-btn"
                      aria-label="Add to cart"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedProduct(product);
                      }}
                    >
                      <img src={CartIcon} alt="CartIcon" /> Add to Cart
                    </button>
                  </div>
                </div>

                <div className="product-info">
                  <h3 title={product.name}>{product.name}</h3>
                  <div className="prices">
                    <span className="old">{product.oldPrice}</span>
                    <span className="new">{product.newPrice}</span>
                  </div>
                  <div className="prices">
                    <span className="emcoin">
                      Earn MCoin : {Number(product.earnMCoin || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="ratingGrp">
                    <div className="ratingGrpLft">
                      {product.is_warranty && (
                        <div className="delivery">
                          <img
                            src={warrantyIcon}
                            alt="Warranty"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                    {product.fastDeliveryTag && (
                      <div className="delivery">
                        <img
                          src={fastDeliveryIcon}
                          alt="Fast Delivery"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </UserProfileLayout>
  );
};

export default ProfileWishlist;
