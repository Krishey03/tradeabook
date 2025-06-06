import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";


const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

const useExchangeOffers = (userEmail) => {
  const [incomingOffers, setIncomingOffers] = useState([]);
  const [outgoingOffers, setOutgoingOffers] = useState([]);
  const [loading, setLoading] = useState({
    incoming: false,
    outgoing: false,
  });
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerDetailsOpen, setOfferDetailsOpen] = useState(false);

  const fetchIncomingOffers = async () => {
    setLoading((prev) => ({ ...prev, incoming: true }));
    try {
      const response = await fetch(
        `/shop/products/exchangeOffers/${userEmail}`
      );
      const data = await response.json();
      setIncomingOffers(data.data || []);
    } catch (error) {
      console.error("Error fetching incoming exchange offers:", error);
      toast.error("Failed to load incoming offers");
    } finally {
      setLoading((prev) => ({ ...prev, incoming: false }));
    }
  };

  const fetchOutgoingOffers = async () => {
    setLoading((prev) => ({ ...prev, outgoing: true }));
    try {
      const response = await fetch(
        `/shop/products/exchangeOffers/user/${userEmail}`
      );
      const data = await response.json();
      setOutgoingOffers(data.data || []);
    } catch (error) {
      console.error("Error fetching outgoing exchange offers:", error);
      toast.error("Failed to load outgoing offers");
    } finally {
      setLoading((prev) => ({ ...prev, outgoing: false }));
    }
  };

  // Initial fetch and WebSocket setup
  useEffect(() => {
    if (!userEmail) return;

    fetchIncomingOffers();
    fetchOutgoingOffers();

    socket.emit("joinRoom", userEmail);

    socket.on("newOffer", (offer) => {
      if (offer.receiverEmail === userEmail) {
        setIncomingOffers((prev) => [offer, ...prev]);
        toast.success("New exchange offer received!");
      }
    });

    socket.on("offerUpdated", (updatedOffer) => {
      setIncomingOffers((prev) =>
        prev.map((offer) =>
          offer._id === updatedOffer._id ? updatedOffer : offer
        )
      );
      toast("An exchange offer was updated");
    });

    return () => {
      socket.off("newOffer");
      socket.off("offerUpdated");
    };
  }, [userEmail]);

  const handleViewDetails = (offer) => {
    setSelectedOffer(offer);
    setOfferDetailsOpen(true);
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      const response = await fetch(
        `/shop/products/exchangeOffers/accept/${offerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to accept exchange offer");
      }

      const data = await response.json();

      setIncomingOffers((prevOffers) =>
        prevOffers.map((offer) =>
          offer._id === offerId
            ? { ...offer, offerStatus: "accepted" }
            : offer
        )
      );

      localStorage.setItem(
        "acceptedExchangeOffer",
        JSON.stringify(data.exchangeOffer)
      );

      toast.success("Exchange offer accepted!");
      setOfferDetailsOpen(false);

      socket.emit("offerAccepted", data.exchangeOffer);
    } catch (error) {
      console.error("Error accepting exchange offer:", error);
      toast.error("Failed to accept exchange offer");
    }
  };

  const handleRejectOffer = async (offerId) => {
    try {
      const response = await fetch(
        `/shop/products/exchangeOffers/${offerId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject exchange offer");
      }

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
    setOfferDetailsOpen,
  };
};

export default useExchangeOffers;
