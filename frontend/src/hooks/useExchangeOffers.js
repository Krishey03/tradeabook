import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import api from "@/api/axios"; // Make sure this path is correct

// Move socket initialization inside the hook
const useExchangeOffers = (userEmail) => {
  const [incomingOffers, setIncomingOffers] = useState([]);
  const [outgoingOffers, setOutgoingOffers] = useState([]);
  const [loading, setLoading] = useState({
    incoming: false,
    outgoing: false,
  });
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerDetailsOpen, setOfferDetailsOpen] = useState(false);
  
  // Initialize socket only once
  const [socket] = useState(() => io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
  }));

  const fetchIncomingOffers = async () => {
    setLoading((prev) => ({ ...prev, incoming: true }));
    try {
      const response = await api.get(`/shop/products/exchangeOffers/${userEmail}`);
      setIncomingOffers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching incoming exchange offers:", error);
      toast.error(error.response?.data?.message || "Failed to load incoming offers");
    } finally {
      setLoading((prev) => ({ ...prev, incoming: false }));
    }
  };

  const fetchOutgoingOffers = async () => {
    setLoading((prev) => ({ ...prev, outgoing: true }));
    try {
      const response = await api.get(`/shop/products/exchangeOffers/user/${userEmail}`);
      setOutgoingOffers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching outgoing exchange offers:", error);
      toast.error(error.response?.data?.message || "Failed to load outgoing offers");
    } finally {
      setLoading((prev) => ({ ...prev, outgoing: false }));
    }
  };

  // Socket event handlers
  useEffect(() => {
    if (!userEmail) return;

    const handleNewOffer = (offer) => {
      if (offer.receiverEmail === userEmail) {
        setIncomingOffers((prev) => [offer, ...prev]);
        toast.success("New exchange offer received!");
      }
    };

    const handleOfferUpdated = (updatedOffer) => {
      setIncomingOffers((prev) =>
        prev.map((offer) =>
          offer._id === updatedOffer._id ? updatedOffer : offer
        )
      );
      toast("An exchange offer was updated");
    };

    socket.emit("joinRoom", userEmail);
    socket.on("newOffer", handleNewOffer);
    socket.on("offerUpdated", handleOfferUpdated);

    return () => {
      socket.off("newOffer", handleNewOffer);
      socket.off("offerUpdated", handleOfferUpdated);
      socket.emit("leaveRoom", userEmail);
    };
  }, [userEmail, socket]);

  // Fetch data on mount
  useEffect(() => {
    if (userEmail) {
      fetchIncomingOffers();
      fetchOutgoingOffers();
    }
  }, [userEmail]);

  const handleViewDetails = (offer) => {
    setSelectedOffer(offer);
    setOfferDetailsOpen(true);
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      const response = await api.put(`/shop/products/exchangeOffers/accept/${offerId}`);
      
      setIncomingOffers((prevOffers) =>
        prevOffers.map((offer) =>
          offer._id === offerId
            ? { ...offer, offerStatus: "accepted" }
            : offer
        )
      );

      localStorage.setItem(
        "acceptedExchangeOffer",
        JSON.stringify(response.data.exchangeOffer)
      );

      toast.success("Exchange offer accepted!");
      setOfferDetailsOpen(false);

      socket.emit("offerAccepted", response.data.exchangeOffer);
    } catch (error) {
      console.error("Error accepting exchange offer:", error);
      toast.error(error.response?.data?.message || "Failed to accept exchange offer");
    }
  };

  const handleRejectOffer = async (offerId) => {
    try {
      await api.patch(`/shop/products/exchangeOffers/${offerId}`);

      setIncomingOffers((prevOffers) =>
        prevOffers.map((offer) =>
          offer._id === offerId
            ? { ...offer, offerStatus: "declined" }
            : offer
        )
      );

      toast.success("Exchange offer declined");
      setOfferDetailsOpen(false);

      socket.emit("offerRejected", { offerId });
    } catch (error) {
      console.error("Error rejecting exchange offer:", error);
      toast.error(error.response?.data?.message || "Failed to reject exchange offer");
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
    setOfferDetailsOpen,
  };
};

export default useExchangeOffers;