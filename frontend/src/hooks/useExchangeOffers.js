import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const useExchangeOffers = (userEmail) => {
  const [exchangeOffers, setExchangeOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerDetailsOpen, setOfferDetailsOpen] = useState(false);

  useEffect(() => {
    if (!userEmail) return;

    const fetchExchangeOffers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/shop/products/exchangeOffers/user/${userEmail}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch exchange offers");
        }

        const data = await response.json();
        setExchangeOffers(data.data || []);
      } catch (error) {
        console.error("Error fetching exchange offers:", error);
        toast.error("Failed to load exchange offers");
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeOffers();
  }, [userEmail]);

  const handleViewDetails = (offer) => {
    setSelectedOffer(offer);
    setOfferDetailsOpen(true);
  };

  const handleAcceptOffer = async (offerId) => {
    toast.success("Exchange offer accepted!");
    setOfferDetailsOpen(false);
    // Implement accept logic (e.g., API call)
  };

  const handleRejectOffer = async (offerId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/shop/products/exchangeOffers/${offerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offerStatus: "declined",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject exchange offer");
      }

      setExchangeOffers((prevOffers) =>
        prevOffers.map((offer) =>
          offer._id === offerId ? { ...offer, offerStatus: "declined" } : offer
        )
      );

      toast.success("Exchange offer declined");
      setOfferDetailsOpen(false);
    } catch (error) {
      console.error("Error rejecting exchange offer:", error);
      toast.error("Failed to reject exchange offer");
    }
  };

  return {
    exchangeOffers,
    loading,
    selectedOffer,
    offerDetailsOpen,
    handleViewDetails,
    handleAcceptOffer,
    handleRejectOffer,
    setOfferDetailsOpen, // Allow closing the offer details dialog
  };
};

export default useExchangeOffers;
