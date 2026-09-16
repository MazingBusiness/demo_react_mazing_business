import React, { useEffect, useState } from "react";
import { FiArrowRight, FiBox, FiClock, FiDownload, FiGift, FiTag } from "react-icons/fi";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import noImage from "../assets/images/no-image.png";
import { applyOffer, getValidOffersForPage, offerDownloadPdf } from "../api/apiRequest";
import "../styles/OfferList.css";

const getBannerImage = (offer) =>
  offer?.offer_banner ||
  offer?.offer_products?.[0]?.product_details?.images?.[0]?.file_name ||
  noImage;

const getCardImage = (offer) =>
  offer?.offer_banner?.product_details?.images?.[0]?.file_name ||
  offer?.offer_banner ||
  noImage;

const formatDate = (value) => {
  if (!value) return "While stocks last";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getOfferRequirement = (offer) => {
  const product = offer?.offer_products?.[0];
  if (Number(offer?.offer_type) === 2 && offer?.offer_value) {
    return `Minimum order value ₹${Number(offer.offer_value).toLocaleString("en-IN")}`;
  }
  if (Number(offer?.offer_type) === 3) return "Complementary product offer";
  if (product?.min_qty) return `Order minimum ${product.min_qty} Pc${Number(product.min_qty) === 1 ? "" : "s"} at ₹${product.offer_price}`;
  return offer?.offer_type_in_text || "Special offer";
};

const getOfferCode = (offer) =>
  offer?.offer_code || offer?.code || offer?.offer_id || "";

const OfferList = () => {
  const [offers, setOffers] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const isMore = page > 1;
      isMore ? setLoadingMore(true) : setLoading(true);
      try {
        const response = await getValidOffersForPage({
          page,
          category_id: selectedCategory,
          brand_id: selectedBrand,
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result?.res === false) {
          throw new Error(result?.msg || "Unable to load offers.");
        }
        if (!active) return;

        const paginator = result?.offers || {};
        const rows = Array.isArray(paginator?.data)
          ? paginator.data
          : Array.isArray(result?.offers)
            ? result.offers
            : [];
        setOffers((current) => (isMore ? [...current, ...rows] : rows));
        setLastPage(Number(paginator?.last_page || 1));
        setTotal(Number(paginator?.total ?? rows.length));
        setBanners(Array.isArray(result?.showInBanner) ? result.showInBanner : []);
        setCategories(Array.isArray(result?.categories) ? result.categories : []);
        setBrands(Array.isArray(result?.brands) ? result.brands : []);
      } catch (error) {
        if (!active) return;
        if (!isMore) setOffers([]);
        toast.error(error?.message || "Unable to load offers.");
      } finally {
        if (active) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };
    load();
    return () => { active = false; };
  }, [page, selectedCategory, selectedBrand]);

  useEffect(() => {
    if (banners.length < 2) return undefined;
    const timer = window.setInterval(
      () => setActiveBanner((current) => (current + 1) % banners.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [banners.length]);

  const visibleBanner = banners[activeBanner];
  const getBrandName = (offer) => {
    const brandId = offer?.offer_products?.[0]?.product_details?.brand_id;
    return brands.find((brand) => String(brand.id) === String(brandId))?.name || "";
  };

  const changeCategory = (id) => {
    setSelectedCategory(id ? String(id) : "");
    setSelectedBrand("");
    setPage(1);
  };
  const changeBrand = (id) => {
    setSelectedBrand(id ? String(id) : "");
    setPage(1);
  };

  const handleApply = async (offerId) => {
    if (!offerId || applyingId) return;
    setApplyingId(offerId);
    try {
      const response = await applyOffer(offerId);
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.res === false) {
        throw new Error(result?.msg || "Offer apply failed");
      }
      toast.success(result?.msg || "Offer applied.");
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setApplyingId(null);
    }
  };

  const handleDownloadPdf = async () => {
    if (downloadingPdf) return;
    setDownloadingPdf(true);

    try {
      const response = await offerDownloadPdf();
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result?.msg || result?.message || "Unable to download offers PDF.");
      }

      const pdfBlob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      const quotedName = disposition.match(/filename="([^"]+)"/i)?.[1];
      const plainName = disposition.match(/filename=([^;]+)/i)?.[1]?.trim();
      const fileName = encodedName
        ? decodeURIComponent(encodedName)
        : quotedName || plainName || "special-deals.pdf";

      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast.error(error?.message || "Unable to download offers PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <MainLayout>
      <main className="offer-list-page">
        <div className="maincontainer">
          {visibleBanner && (
            <section className="offer-hero" aria-label="Featured offers">
              <div className="offer-hero-copy">
                <span className="offer-hero-badge">Premium Offer</span>
                <h1>{visibleBanner?.offer_name || "Special Offer"}</h1>
                <p>{visibleBanner?.offer_description || getOfferRequirement(visibleBanner)}</p>
                <div className="offer-hero-facts">
                  <span><small>Valid till</small>{formatDate(visibleBanner?.offer_validity_end)}</span>
                  <span><small>Offer code</small>{getOfferCode(visibleBanner)}</span>
                </div>
                <button type="button" disabled={applyingId === visibleBanner.id} onClick={() => handleApply(visibleBanner.id)}>
                  {applyingId === visibleBanner.id ? "Applying..." : "Apply Offer"} <FiArrowRight />
                </button>
              </div>
              <div className="offer-hero-media">
                <img src={getBannerImage(visibleBanner)} alt={visibleBanner?.offer_name || "Featured offer"} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = noImage; }} />
              </div>
              {banners.length > 1 && (
                <div className="offer-hero-dots">
                  {banners.map((banner, index) => (
                    <button key={banner?.id || index} type="button" className={index === activeBanner ? "active" : ""} onClick={() => setActiveBanner(index)} aria-label={`Show banner ${index + 1}`} />
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="offer-filters" aria-label="Offer filters">
            <div className="offer-filter-group">
              <h2><FiBox /> Sub-category</h2>
              <div className="offer-filter-options">
                <button type="button" className={!selectedCategory ? "active" : ""} onClick={() => changeCategory("")}>All</button>
                {categories.map((category) => (
                  <button key={category.id} type="button" className={selectedCategory === String(category.id) ? "active" : ""} onClick={() => changeCategory(category.id)}>
                    {category.name} <span>{category.product_count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="offer-filter-group">
              <h2><FiTag /> Brand</h2>
              <div className="offer-filter-options brand-options">
                <button type="button" className={!selectedBrand ? "active" : ""} onClick={() => changeBrand("")}>All</button>
                {brands.map((brand) => (
                  <button key={brand.id} type="button" className={selectedBrand === String(brand.id) ? "active" : ""} onClick={() => changeBrand(brand.id)}>
                    {brand.name} <span>{brand.product_count}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="offer-results">
            <div className="offer-results-heading">
              <h1>All Active Offers ({total})</h1>
              <button type="button" className="offer-download-pdf" disabled={downloadingPdf} onClick={handleDownloadPdf}>
                <FiDownload /> {downloadingPdf ? "Downloading..." : "Download PDF"}
              </button>
            </div>

            {loading ? (
              <div className="offer-status">Loading offers...</div>
            ) : offers.length === 0 ? (
              <div className="offer-status">No active offers found for these filters.</div>
            ) : (
              <div className="offer-grid">
                {offers.map((offer) => (
                  <article className="offer-list-card" key={offer.id}>
                    <div className="offer-card-image">
                      <img src={getCardImage(offer)} alt={offer?.offer_name || "Offer"} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = noImage; }} />
                      <span className={`offer-kind kind-${Number(offer?.offer_type || 0)}`}>{offer?.offer_type_in_text || "Special offer"}</span>
                      {getBrandName(offer) && <span className="offer-card-brand">{getBrandName(offer)}</span>}
                    </div>
                    <div className="offer-card-body">
                      <h2>{offer?.offer_name || "Special Offer"}</h2>
                      <p>{offer?.offer_description || "Exclusive savings available for a limited time."}</p>
                      <div className="offer-card-meta">
                        <span><FiGift /> {getOfferRequirement(offer)}</span>
                        <span><FiClock /> Valid till {formatDate(offer?.offer_validity_end)}</span>
                      </div>
                    </div>
                    <button type="button" className="offer-apply-button" disabled={applyingId === offer.id} onClick={() => handleApply(offer.id)}>
                      {applyingId === offer.id ? "Applying..." : "Apply Offer"} <FiArrowRight />
                    </button>
                  </article>
                ))}
              </div>
            )}

            {page < lastPage && (
              <button type="button" className="offer-load-more" disabled={loadingMore} onClick={() => setPage((current) => current + 1)}>
                {loadingMore ? "Loading..." : "Load More Offer"}
              </button>
            )}
          </section>
        </div>
      </main>
    </MainLayout>
  );
};

export default OfferList;
