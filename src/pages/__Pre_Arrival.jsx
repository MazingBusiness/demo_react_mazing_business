import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiCalendar, FiDownload, FiMapPin, FiMenu, FiTag, FiX } from "react-icons/fi";
import UserProfileLayout from "../layouts/UserProfileLayout";
import {
  downloadPreArrivalProductPdf,
  getAllCategoryGroups,
  getPreArrivalItems,
  savePreArrivalOrder,
  userDetails,
} from "../api/apiRequest";
import no_image from "../assets/images/no-image.png";

const ALL = "all";

const formatEtaDate = (date) => {
  if (!date) return "";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsedDate).replaceAll("/", "-");
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(price) || 0);

const getExistingOrderQuantity = (existingOrderItem) => {
  const quantities = [
    existingOrderItem?.qty_41,
    existingOrderItem?.qty_pre_fb,
    existingOrderItem?.qty_post_fb,
  ];
  const existingQuantity = quantities
    .map((quantity) => Number(quantity) || 0)
    .find((quantity) => quantity > 0);

  return existingQuantity || 0;
};

const getAddressValue = (value) =>
  typeof value === "object" && value !== null ? value.name ?? "" : value ?? "";

const normalizeAddress = (address) => ({
  id: address?.id ?? address?.address_id,
  setDefault: Number(address?.set_default) === 1,
  gstin: address?.gstin ?? "",
  companyName: address?.company_name ?? "",
  address: address?.address ?? "",
  address2: address?.address_2 ?? "",
  postalCode: address?.postal_code ?? "",
  city: getAddressValue(address?.city),
  state: getAddressValue(address?.state),
  country: getAddressValue(address?.country) || "India",
  phone: address?.phone ?? "",
});

const getUserAddresses = (response) => {
  const user = response?.data?.userDetails
    ?? response?.data?.user
    ?? response?.userDetails
    ?? response?.user
    ?? response?.data
    ?? response;
  const addressList = response?.get_addresses
    ?? response?.data?.get_addresses
    ?? user?.get_addresses
    ?? [];

  return (Array.isArray(addressList) ? addressList : [])
    .map(normalizeAddress)
    .filter((address) => address.id);
};

const getExistingPreArrivalOrderId = (group) =>
  group?.order_id ??
  group?.existing_order_id ??
  group?.existing_order?.id ??
  (group?.products || []).find((item) => item?.existing_order_item?.order_id)
    ?.existing_order_item?.order_id;

const getExistingPreArrivalAddressId = (group) =>
  group?.address_id ??
  group?.existing_address_id ??
  group?.existing_order?.address_id ??
  group?.order?.address_id ??
  (group?.products || []).find(
    (item) => item?.existing_order_item?.address_id || item?.existing_order_item?.order?.address_id
  )?.existing_order_item?.address_id ??
  (group?.products || []).find((item) => item?.existing_order_item?.order?.address_id)
    ?.existing_order_item?.order?.address_id;

const PreArrival = () => {
  const [arrivalGroups, setArrivalGroups] = useState([]);
  const [categoryGroups, setCategoryGroups] = useState([]);
  const [selectedDate, setSelectedDate] = useState(ALL);
  const [selectedCategory, setSelectedCategory] = useState(ALL);
  const [quantities, setQuantities] = useState({});
  const [initialQuantities, setInitialQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [error, setError] = useState("");
  const [headerInView, setHeaderInView] = useState(true);
  const [stickyHeaderOpen, setStickyHeaderOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const headerSentinelRef = useRef(null);
  const contentRef = useRef(null);
  const saveBarRef = useRef(null);
  const allowNavigationRef = useRef(false);

  useEffect(() => {
    const sentinel = headerSentinelRef.current;
    if (!sentinel) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeaderInView(entry.isIntersecting);
        if (entry.isIntersecting) setStickyHeaderOpen(false);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    const saveBar = saveBarRef.current;
    if (!content || !saveBar) return undefined;

    const alignSaveBar = () => {
      const contentRect = content.getBoundingClientRect();
      saveBar.style.left = `${contentRect.left}px`;
      saveBar.style.width = `${contentRect.width}px`;
    };
    const resizeObserver = new ResizeObserver(alignSaveBar);

    alignSaveBar();
    resizeObserver.observe(content);
    window.addEventListener("resize", alignSaveBar);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", alignSaveBar);
    };
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([getPreArrivalItems(), getAllCategoryGroups().then((response) => response.json())])
      .then(([preArrivalResponse, categoryResponse]) => {
        if (!active) return;

        const groups = Array.isArray(preArrivalResponse?.data)
          ? preArrivalResponse.data
          : [];
        const categories = Array.isArray(categoryResponse?.data)
          ? categoryResponse.data
          : [];
        const initialQuantities = {};

        groups.forEach((group) => {
          (group?.products || []).forEach((item) => {
            initialQuantities[item.id] = getExistingOrderQuantity(
              item?.existing_order_item
            );
          });
        });

        setArrivalGroups(groups);
        setCategoryGroups(categories);
        setQuantities(initialQuantities);
        setInitialQuantities(initialQuantities);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load pre-arrival items.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const hasUnsavedQuantityChanges = useMemo(() => {
    const itemIds = new Set([
      ...Object.keys(initialQuantities),
      ...Object.keys(quantities),
    ]);

    return [...itemIds].some(
      (itemId) =>
        (Number(quantities[itemId]) || 0) !==
        (Number(initialQuantities[itemId]) || 0)
    );
  }, [initialQuantities, quantities]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedQuantityChanges || allowNavigationRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };

    const handleLinkClick = (event) => {
      if (!hasUnsavedQuantityChanges || allowNavigationRef.current) return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = event.target.closest("a[href]");
      if (!link || link.hasAttribute("download")) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.href === window.location.href) return;

      event.preventDefault();
      event.stopPropagation();
      setPendingNavigation({ href: destination.href });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleLinkClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, [hasUnsavedQuantityChanges]);

  const etaDates = useMemo(() => {
    const dates = arrivalGroups
      .map((group) => group?.bl_detail?.eta_date || group?.eta_date)
      .filter(Boolean);
    return [...new Set(dates)];
  }, [arrivalGroups]);

  const productsForSelectedDate = useMemo(
    () => arrivalGroups
      .filter((group) => {
        const etaDate = group?.bl_detail?.eta_date || group?.eta_date;
        return selectedDate === ALL || etaDate === selectedDate;
      })
      .flatMap((group) => group?.products || []),
    [arrivalGroups, selectedDate]
  );

  const subCategories = useMemo(() => {
    const productCategoryIds = new Set(
      productsForSelectedDate
        .map((item) => Number(item?.product?.category_id))
        .filter(Boolean)
    );
    const uniqueCategories = new Map();

    categoryGroups.forEach((group) => {
      (group?.child_category || []).forEach((category) => {
        const categoryId = Number(category?.id);
        if (productCategoryIds.has(categoryId) && !uniqueCategories.has(categoryId)) {
          uniqueCategories.set(categoryId, category);
        }
      });
    });

    return [...uniqueCategories.values()];
  }, [categoryGroups, productsForSelectedDate]);

  useEffect(() => {
    if (
      selectedCategory !== ALL &&
      !subCategories.some((category) => String(category.id) === selectedCategory)
    ) {
      setSelectedCategory(ALL);
    }
  }, [selectedCategory, subCategories]);

  useEffect(() => {
    if (!addressModalOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !saving) setAddressModalOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [addressModalOpen, saving]);

  const visibleProducts = useMemo(
    () => productsForSelectedDate.filter(
      (item) => selectedCategory === ALL ||
        String(item?.product?.category_id) === selectedCategory
    ),
    [productsForSelectedDate, selectedCategory]
  );

  const visibleEtaSections = useMemo(() => {
    const sections = new Map();

    arrivalGroups.forEach((group) => {
      const etaDate = group?.bl_detail?.eta_date || group?.eta_date || "";
      if (selectedDate !== ALL && etaDate !== selectedDate) return;

      const products = (group?.products || []).filter(
        (item) => selectedCategory === ALL ||
          String(item?.product?.category_id) === selectedCategory
      );
      if (products.length === 0) return;

      const sectionKey = etaDate || "date-pending";
      if (!sections.has(sectionKey)) {
        sections.set(sectionKey, { etaDate, products: [] });
      }
      sections.get(sectionKey).products.push(...products);
    });

    return [...sections.values()];
  }, [arrivalGroups, selectedCategory, selectedDate]);

  const changeQuantity = (itemId, amount) => {
    setQuantities((current) => {
      const currentQuantity = Number(current[itemId]) || 0;
      return {
        ...current,
        [itemId]: Math.max(0, currentQuantity + amount),
      };
    });
  };

  const setQuantity = (itemId, value) => {
    const digitsOnly = String(value).replace(/\D/g, "");
    const numericValue = Number.parseInt(digitsOnly, 10);
    const safeValue = Number.isNaN(numericValue) ? 0 : numericValue;

    setQuantities((current) => ({
      ...current,
      [itemId]: safeValue,
    }));
  };

  const handleExportList = async () => {
    try {
      setExporting(true);
      const etaDate = selectedDate === ALL ? "" : selectedDate.slice(0, 10);
      const categoryId = selectedCategory === ALL ? "" : selectedCategory;
      const { pdfUrl, fileName } = await downloadPreArrivalProductPdf({
        etaDate,
        categoryId,
      });
      const downloadLink = document.createElement("a");

      downloadLink.href = pdfUrl;
      downloadLink.download = fileName;
      downloadLink.target = "_blank";
      downloadLink.rel = "noopener noreferrer";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
    } catch (downloadError) {
      console.error("Pre-arrival PDF download failed:", downloadError);
      alert(downloadError.message || "Unable to download pre-arrival PDF.");
    } finally {
      setExporting(false);
    }
  };

  const handleOpenAddressModal = async () => {
    const hasPositiveQuantity = arrivalGroups.some((group) =>
      (group?.products || []).some(
        (item) => (Number(quantities[item?.id]) || 0) > 0
      )
    );
    const canSubmitOrder = arrivalGroups.some((group) => {
      const products = group?.products || [];
      return Boolean(getExistingPreArrivalOrderId(group)) || products.some(
        (item) => (Number(quantities[item?.id]) || 0) > 0
      );
    });

    if (!canSubmitOrder) {
      alert("Enter a quantity greater than 0 for at least one product.");
      return;
    }

    if (!hasPositiveQuantity) {
      const existingGroup = arrivalGroups.find(
        (group) => getExistingPreArrivalOrderId(group) && getExistingPreArrivalAddressId(group)
      );
      let existingAddressId = existingGroup
        ? getExistingPreArrivalAddressId(existingGroup)
        : null;

      if (!existingAddressId) {
        try {
          setLoadingAddresses(true);
          const response = await userDetails();
          const savedAddresses = getUserAddresses(response);
          const lastAddressId = response?.lastOrderAddressId
            ?? response?.data?.lastOrderAddressId;
          const lastAddress = lastAddressId
            ? savedAddresses.find(
              (address) => String(address.id) === String(lastAddressId)
            )
            : null;
          existingAddressId = lastAddress?.id
            ?? savedAddresses.find((address) => address.setDefault)?.id
            ?? savedAddresses[0]?.id;
        } catch (requestError) {
          console.error("Unable to load the existing order address:", requestError);
          alert(requestError.message || "Unable to load the existing order address.");
          return;
        } finally {
          setLoadingAddresses(false);
        }
      }

      if (!existingAddressId) {
        alert("No saved address is available for this existing order.");
        return;
      }

      await handleSaveOrder(existingAddressId);
      return;
    }

    setAddressModalOpen(true);
    setLoadingAddresses(true);
    setAddressError("");
    setSelectedAddressId(null);

    try {
      const response = await userDetails();
      const normalizedAddresses = getUserAddresses(response);

      setAddresses(normalizedAddresses);
      if (normalizedAddresses.length === 0) {
        setAddressError("No delivery addresses are available for this account.");
      }
    } catch (requestError) {
      console.error("Unable to load delivery addresses:", requestError);
      setAddresses([]);
      setAddressError(requestError.message || "Unable to load delivery addresses.");
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSaveOrder = async (addressId = selectedAddressId) => {
    const orderIds = {};
    const rows = [];

    arrivalGroups.forEach((group) => {
      const preArrivalDetailId = group?.id ?? group?.pre_arrival_detail_id;
      if (!preArrivalDetailId) return;

      const existingOrderId = getExistingPreArrivalOrderId(group);
      const selectedProducts = existingOrderId
        ? (group?.products || [])
        : (group?.products || []).filter(
          (item) => (Number(quantities[item?.id]) || 0) > 0
        );
      if (selectedProducts.length === 0) return;

      if (existingOrderId) {
        orderIds[preArrivalDetailId] = existingOrderId;
      }

      selectedProducts.forEach((item) => {
        rows.push({
          id: item.id,
          pre_arrival_detail_id: preArrivalDetailId,
          manager_41: 0,
          pre_fb: 0,
          post_fb: Number(quantities[item.id]) || 0,
          price_41: Number(item.manager_41) || 0,
          price_pre_fb: Number(item.pre_fb) || 0,
          price_post_fb: Number(item.post_fb) || 0,
        });
      });
    });

    if (rows.length === 0) {
      alert("Enter a quantity greater than 0 for at least one product.");
      return;
    }

    try {
      setSaving(true);
      const response = await savePreArrivalOrder({
        address_id: addressId,
        order_ids: orderIds,
        rows,
      });
      const savedOrders = Array.isArray(response?.data?.orders)
        ? response.data.orders
        : [];

      if (savedOrders.length > 0) {
        const savedOrderIds = new Map(
          savedOrders.map((order) => [
            String(order.pre_arrival_detail_id),
            order.order_id,
          ])
        );
        setArrivalGroups((groups) => groups.map((group) => {
          const groupId = group?.id ?? group?.pre_arrival_detail_id;
          const savedOrderId = savedOrderIds.get(String(groupId));
          return savedOrderId ? { ...group, order_id: savedOrderId } : group;
        }));
      }

      setAddressModalOpen(false);
      setInitialQuantities({ ...quantities });
      alert(response?.message || "Pre-arrival order saved successfully.");
    } catch (saveError) {
      console.error("Pre-arrival order save failed:", saveError);
      alert(saveError.message || "Unable to save pre-arrival order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <UserProfileLayout>
      <section className="pre-arrival-page">
        {!headerInView && (
          <button
            type="button"
            className={`pre-arrival-header-menu ${stickyHeaderOpen ? "is-open" : ""}`}
            onClick={() => setStickyHeaderOpen((open) => !open)}
            aria-label={stickyHeaderOpen ? "Close pre-arrival filters" : "Open pre-arrival filters"}
            aria-expanded={stickyHeaderOpen}
          >
            {stickyHeaderOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
        )}

        <header className={`pre-arrival-header ${!headerInView && stickyHeaderOpen ? "is-sticky-open" : ""}`}>
          <div className="pre-arrival-title-row">
            <h1>Pre Arrival</h1>
            <button
              type="button"
              className="pre-arrival-export-btn"
              onClick={handleExportList}
              disabled={exporting}
            >
              <FiDownload aria-hidden="true" />
              {exporting ? "EXPORTING..." : "EXPORT LIST"}
            </button>
          </div>

          <div className="pre-arrival-filter-row">
            <div className="pre-arrival-filter-label">
              <FiCalendar aria-hidden="true" />
              <span>ETA DATE</span>
            </div>
            <div className="pre-arrival-filter-options">
              <button type="button" className={selectedDate === ALL ? "active" : ""} onClick={() => setSelectedDate(ALL)}>All</button>
              {etaDates.map((date) => (
                <button type="button" key={date} className={selectedDate === date ? "active" : ""} onClick={() => setSelectedDate(date)}>
                  {formatEtaDate(date)}
                </button>
              ))}
            </div>
          </div>

          <div className="pre-arrival-filter-row">
            <div className="pre-arrival-filter-label">
              <FiTag aria-hidden="true" />
              <span>SUB-CATEGORY</span>
            </div>
            <div className="pre-arrival-filter-options">
              <button type="button" className={selectedCategory === ALL ? "active" : ""} onClick={() => setSelectedCategory(ALL)}>All</button>
              {subCategories.map((category) => (
                <button type="button" key={category.id} className={selectedCategory === String(category.id) ? "active" : ""} onClick={() => setSelectedCategory(String(category.id))}>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </header>
        <div ref={headerSentinelRef} className="pre-arrival-header-sentinel" />

        <div className="pre-arrival-content" ref={contentRef}>
          {loading && <div className="pre-arrival-status">Loading pre-arrival items...</div>}
          {!loading && error && <div className="pre-arrival-status pre-arrival-error">{error}</div>}
          {!loading && !error && visibleProducts.length === 0 && <div className="pre-arrival-status">No pre-arrival products found.</div>}

          {!loading && !error && visibleProducts.length > 0 && (
            <div className="pre-arrival-eta-sections">
              {visibleEtaSections.map((section) => (
                <section className="pre-arrival-eta-section" key={section.etaDate || "date-pending"}>
                  <div className="pre-arrival-eta-bar">
                    <div className="pre-arrival-eta-date">
                      <span className="pre-arrival-eta-icon"><FiCalendar aria-hidden="true" /></span>
                      <span>
                        <small>ESTIMATED ARRIVAL</small>
                        <strong>{section.etaDate ? formatEtaDate(section.etaDate) : "Date pending"}</strong>
                      </span>
                    </div>
                    <div className="pre-arrival-expected">
                      <strong>{section.products.length}</strong>
                      <span>{section.products.length === 1 ? "product" : "products"}</span>
                    </div>
                  </div>

                  <div className="pre-arrival-product-grid">
                    {section.products.map((item, index) => {
                      const product = item?.product || {};
                      const productName = product.name || item.item_name || "Product";
                      return (
                        <article className="pre-arrival-product-card" key={item.id || item.product_id}>
                          <div className="pre-arrival-product-image">
                            {/* {index === 0 && <span>NEW ARRIVAL</span>} */}
                            <img src={item.photo_url || no_image} alt={productName} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = no_image; }} />
                          </div>
                          <div className="pre-arrival-product-info">
                            <h2>{product.part_no ? `${product.part_no} - ` : ""}{productName}</h2>
                            <p>Price: <strong>₹ {formatPrice(item.post_fb)}</strong></p>
                            <div className="pre-arrival-quantity-row">
                              <span>QTY</span>
                              <div className="pre-arrival-stepper">
                                <button type="button" onClick={() => changeQuantity(item.id, -1)} aria-label={`Decrease ${productName} quantity`}>−</button>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={quantities[item.id] || 0}
                                  onChange={(event) => setQuantity(item.id, event.target.value)}
                                  onBlur={(event) => setQuantity(item.id, event.target.value)}
                                  aria-valuemin="0"
                                  aria-label={`${productName} quantity`}
                                />
                                <button type="button" onClick={() => changeQuantity(item.id, 1)} aria-label={`Increase ${productName} quantity`}>+</button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}

          <div className="pre-arrival-save-bar" ref={saveBarRef}>
            <button type="button" onClick={handleOpenAddressModal} disabled={loadingAddresses || saving || loading}>
              {saving ? "SAVING ORDER..." : loadingAddresses ? "LOADING ADDRESSES..." : "SAVE ORDER"}
            </button>
          </div>
        </div>
      </section>

      {addressModalOpen && (
        <div
          className="pre-arrival-address-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setAddressModalOpen(false);
            }
          }}
        >
          <div
            className="pre-arrival-address-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pre-arrival-address-title"
          >
            <div className="pre-arrival-address-modal-header">
              <div>
                <span><FiMapPin aria-hidden="true" /></span>
                <div>
                  <h2 id="pre-arrival-address-title">Select delivery address</h2>
                  <p>Choose where you would like this pre-arrival order delivered.</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close address selection"
                onClick={() => setAddressModalOpen(false)}
                disabled={saving}
              >
                <FiX aria-hidden="true" />
              </button>
            </div>

            <div className="pre-arrival-address-modal-body">
              {loadingAddresses && (
                <div className="pre-arrival-address-status">Loading your addresses...</div>
              )}
              {!loadingAddresses && addressError && (
                <div className="pre-arrival-address-status pre-arrival-address-error">
                  {addressError}
                </div>
              )}
              {!loadingAddresses && !addressError && (
                <div className="pre-arrival-address-grid" role="radiogroup" aria-label="Delivery addresses">
                  {addresses.map((address) => {
                    const isSelected = String(selectedAddressId) === String(address.id);
                    return (
                      <label
                        className={`pre-arrival-address-card ${isSelected ? "selected" : ""}`}
                        key={address.id}
                      >
                        <input
                          type="radio"
                          name="pre-arrival-address"
                          value={address.id}
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(address.id)}
                        />
                        <span className="pre-arrival-address-radio" aria-hidden="true" />
                        <span className="pre-arrival-address-details">
                          <span><strong>GST IN:</strong> {address.gstin || "-"}</span>
                          <span><strong>Company Name:</strong> {address.companyName || "-"}</span>
                          <span><strong>Address:</strong> {address.address || "-"}</span>
                          <span><strong>Address 2:</strong> {address.address2 || "-"}</span>
                          <span><strong>Postal Code:</strong> {address.postalCode || "-"}</span>
                          <span><strong>City:</strong> {address.city || "-"}</span>
                          <span><strong>State:</strong> {address.state || "-"}</span>
                          <span><strong>Country:</strong> {address.country || "India"}</span>
                          <span><strong>Phone:</strong> {address.phone || "-"}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedAddressId && (
              <div className="pre-arrival-address-modal-footer">
                <button type="button" onClick={() => handleSaveOrder(selectedAddressId)} disabled={saving}>
                  {saving ? "SAVING ORDER..." : "SAVE ORDER"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {pendingNavigation && (
        <div className="pre-arrival-unsaved-overlay" role="presentation">
          <div
            className="pre-arrival-unsaved-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pre-arrival-unsaved-title"
          >
            <h2 id="pre-arrival-unsaved-title">
              Do you want to exit this page without saving your pre arrival order?
            </h2>
            <div className="pre-arrival-unsaved-actions">
              <button
                type="button"
                className="confirm"
                onClick={() => {
                  const destination = pendingNavigation.href;
                  allowNavigationRef.current = true;
                  setPendingNavigation(null);
                  window.location.href = destination;
                }}
              >
                Yes
              </button>
              <button
                type="button"
                className="cancel"
                onClick={() => setPendingNavigation(null)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </UserProfileLayout>
  );
};

export default PreArrival;
