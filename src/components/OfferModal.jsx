import React from "react";
import Modal from "./Modal"; // Reusing your generic Modal component
import OfferCard from "./OfferCard";
import product1 from "../assets/images/demologo.png";

const mockOffers = [
  {
    title: "Opel Select Cutter Combo",
    img: product1,
    description: "",
    type: "TOTAL",
    details: [
      {
        id: 1,
        name: 'OPEL SELECT 5204 - 125MM (5") MARBLE CUTTER (WD)',
        minQty: 12,
        note: `Add more <b>₹50000</b> on this product or others to get <b>Opel Select Cutter Combo</b>`,
        price: 2461,
      },
      {
        id: 2,
        name: 'OPEL SELECT 5232 - 4" MARBLE CUTTER (1650WATTS) (SB)',
        minQty: 12,
        note: `Add more <b>₹50000</b> on this product or others to get <b>Opel Select Cutter Combo</b>`,
        price: 2246,
      },
      {
        id: 3,
        name: 'OPEL SELECT 5230 - 125MM (5") MARBLE CUTTER (MB)',
        minQty: 12,
        note: `Add more <b>₹50000</b> on this product or others to get <b>Opel Select Cutter Combo</b>`,
        price: 2405,
      },
    ],
  },
  {
    title: "SWISS WATCH OFFER",
    img: product1,
    description: "",
    type: "COMPLEMENTARY",
    details: [],
  },
];

const OfferModal = ({ isOpen, onClose }) => {
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
        {mockOffers.map((offer, index) => (
          <OfferCard
            key={index}
            title={offer.title}
            description={offer.description}
            type={offer.type}
            details={offer.details}
            img={offer.img}
            onApply={() => alert(`Applied: ${offer.title}`)}
          />
        ))}
      </div>
    </Modal>
  );
};

export default OfferModal;
