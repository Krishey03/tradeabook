import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const useExchangeOffers = (userEmail) => {
  // Separate state for incoming and outgoing offers
  const [incomingOffers, setIncomingOffers] = useState([]);
  const [outgoingOffers, setOutgoingOffers] = useState([]);
  const [loading, setLoading] = useState({
    incoming: false,
    outgoing: false
  });
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerDetailsOpen, setOfferDetailsOpen] = useState(false);

  useEffect(() => {
    if (!userEmail) return;

    // Fetch offers sent to the user (incoming)
    const fetchIncomingOffers = async () => {
      setLoading(prev => ({ ...prev, incoming: true }));
      try {
        const response = await fetch(`http://localhost:5000/api/shop/products/exchangeOffers/${userEmail}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch incoming exchange offers");
        }

        const data = await response.json();
        setIncomingOffers(data.data || []);
      } catch (error) {
        console.error("Error fetching incoming exchange offers:", error);
        toast.error("Failed to load incoming offers");
      } finally {
        setLoading(prev => ({ ...prev, incoming: false }));
      }
    };

    // Fetch offers sent by the user (outgoing)
    const fetchOutgoingOffers = async () => {
      setLoading(prev => ({ ...prev, outgoing: true }));
      try {
        const response = await fetch(`http://localhost:5000/api/shop/products/exchangeOffers/user/${userEmail}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch outgoing exchange offers");
        }

        const data = await response.json();
        setOutgoingOffers(data.data || []);
      } catch (error) {
        console.error("Error fetching outgoing exchange offers:", error);
        toast.error("Failed to load outgoing offers");
      } finally {
        setLoading(prev => ({ ...prev, outgoing: false }));
      }
    };

    // Fetch both types of offers
    fetchIncomingOffers();
    fetchOutgoingOffers();
  }, [userEmail]);

  const handleViewDetails = (offer) => {
    setSelectedOffer(offer);
    setOfferDetailsOpen(true);
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/shop/products/exchangeOffers/accept/${offerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        }
      });
  
      if (!response.ok) {
        throw new Error("Failed to accept exchange offer");
      }
  
      const data = await response.json();
      
      // Update the local state to reflect the change
      setIncomingOffers((prevOffers) =>
        prevOffers.map((offer) =>
          offer._id === offerId ? { ...offer, offerStatus: "accepted" } : offer
        )
      );
  
      // Store the accepted offer in localStorage for checkout
      localStorage.setItem("acceptedExchangeOffer", JSON.stringify(data.exchangeOffer));
      
      toast.success("Exchange offer accepted!");
      setOfferDetailsOpen(false);
    } catch (error) {
      console.error("Error accepting exchange offer:", error);
      toast.error("Failed to accept exchange offer");
    }
  };

  const handleRejectOffer = async (offerId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/shop/products/exchangeOffers/${offerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error("Failed to reject exchange offer");
      }

      setIncomingOffers((prevOffers) =>
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
    incomingOffers,
    outgoingOffers,
    loading,
    selectedOffer,
    offerDetailsOpen,
    handleViewDetails,
    handleAcceptOffer,
    handleRejectOffer,
    setOfferDetailsOpen
  };
};

export default useExchangeOffers;