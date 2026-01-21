import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal"; // Reusing your generic Modal component
import OfferCard from "./OfferCard";
import product1 from "../assets/images/demologo.png";
import { validOffers, applyOffer } from "../api/apiRequest";

const mockOffers = [
  {
    title: "New Offer cumming soon",
    img: product1,
    description: "",
    type: "Coming",
    details: [],
  },
];

export const OffersPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadOffers = async () => {
      setLoading(true);
      try {
        // ✅ validOffers() returns Response
        const res = await validOffers();

        // ✅ safety: if API fails with non-200
        if (!res?.ok) {
          throw new Error(`validOffers failed: ${res?.status}`);
        }

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("validOffers error:", err);
        setData({ res: false, offers: [] });
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, []);

  // ✅ YOUR EXACT CODE (no change)
  const offers = useMemo(() => {
    return (data?.offers || []).map((offer) => ({
      id: offer?.id || "",
      title: offer?.offer_name || "",
      img:
        offer?.offer_banner ||
        offer?.offer_products?.[0]?.product_details?.images?.[0]?.file_name ||
        "",
      description: offer?.offer_description || "",
      type:
        offer?.complementary_items &&
        String(offer.complementary_items).trim() !== ""
          ? "COMPLEMENTARY"
          : "TOTAL",
      details: (offer?.offer_products || []).map((p) => ({
        productImg: p?.product_details?.images?.[0]?.file_name,
        name: p?.name || "",
        minQty: Number(p?.min_qty || 0),
        note: `Buy <b>${Number(p?.min_qty || 0)}</b> pcs to get <b>${offer?.offer_name || ""}</b>`,
        price:
          Number(p?.offer_price || 0) ||
          Number(p?.product_details?.discount_price || 0) ||
          Number(p?.product_details?.product_price || 0) ||
          Number(p?.mrp || 0),
      })),
    }));
  }, [data]);

  if (loading) return <div>Loading offers...</div>;

  return (
    <div>
      <h3>Offers</h3>
      <pre>{JSON.stringify(offers, null, 2)}</pre>
    </div>
  );
};

const OfferModal = ({ isOpen, onClose, onApplied }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return; // ✅ load only when modal opens

    const loadOffers = async () => {
      setLoading(true);
      try {
        const res = await validOffers();
        if (!res?.ok) throw new Error(`validOffers failed: ${res?.status}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("validOffers error:", err);
        setData({ res: false, offers: [] });
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, [isOpen]);

  // ✅ same mapper for modal
  const offers = useMemo(() => {
    return (data?.offers || []).map((offer) => ({
      id: offer?.id || "",
      title: offer?.offer_name || "",
      img:
        offer?.offer_banner ||
        offer?.offer_products?.[0]?.product_details?.images?.[0]?.file_name ||
        product1, // fallback logo
      description: offer?.offer_description || "",
      type:
        offer?.complementary_items &&
        String(offer.complementary_items).trim() !== ""
          ? "COMPLEMENTARY"
          : "TOTAL",
      details: (offer?.offer_products || []).map((p) => ({
        productImg: p?.product_details?.images?.[0]?.file_name,
        name: p?.name || "",
        minQty: Number(p?.min_qty || 0),
        note: `Buy <b>${Number(p?.min_qty || 0)}</b> pcs to get <b>${offer?.offer_name || ""}</b>`,
        price:
          Number(p?.offer_price || 0) ||
          Number(p?.product_details?.discount_price || 0) ||
          Number(p?.product_details?.product_price || 0) ||
          Number(p?.mrp || 0),
      })),
    }));
  }, [data]);

  // ✅ fallback to mock if API empty
  const finalOffers = offers?.length ? offers : mockOffers;

  // Apply Offer
  const [applyingId, setApplyingId] = useState(null);

  const handleApply = async (offerId) => {
    try {
      const res = await applyOffer(offerId); // or applyOffer({ offer_id: offerId })
      const json = await res.json(); // ✅ must read response body
      console.log("apply-offer json:", json);
      if (json?.res === false) {
        alert(json?.msg || "Offer apply failed");
        return;
      }else{
        alert(json?.msg || "Offer applied.");
      }
      onClose?.();
      // ✅ refresh cart
      await onApplied?.(); // call your cart refresh function
    } catch (e) {
      console.error(e);
      alert(e?.message || "Something went wrong");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xlg"
      className="offer-modal"
      closeButtonClass="offer-modal-close"
    >
      <div className="offer-modal-box">
        <h3 style={{ marginBottom: "20px" }}>Offer List</h3>

        {loading ? (
          <div>Loading offers...</div>
        ) : (
          finalOffers.map((offer, index) => (
            <OfferCard
              key={offer?.title ? `${offer.title}-${index}` : index}
              title={offer.title}
              description={offer.description}
              type={offer.type}
              details={offer.details}
              img={offer.img}
              onApply={() => handleApply(offer.id)}
            />
          ))
        )}
      </div>
    </Modal>
  );
};

export default OfferModal;
