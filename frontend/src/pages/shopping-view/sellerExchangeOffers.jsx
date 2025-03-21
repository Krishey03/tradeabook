import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

function SellerExchangeOffers() {
  const [exchangeOffers, setExchangeOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerDetailsOpen, setOfferDetailsOpen] = useState(false);
  
  // Get current user email from redux state
  const userEmail = useSelector((state) => state.auth.user?.email);

  useEffect(() => {
    if (!userEmail) return;
    
    const fetchExchangeOffers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/shop/products/exchangeOffers/${userEmail}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch exchange offers");
        }
        
        const data = await response.json();
        console.log("Exchange offers data:", data);
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
    // Implement accept exchange offer functionality
    toast.success("Exchange offer accepted!");
    setOfferDetailsOpen(false);
    // You would need to create a new endpoint for accepting offers
  };

  const handleRejectOffer = async (offerId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/shop/products/exchangeOffers/${offerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to reject exchange offer");
      }

      // Remove the rejected offer from the state
      setExchangeOffers((prevOffers) => prevOffers.filter((offer) => offer._id !== offerId));

      toast.success("Exchange offer rejected and removed");
      setOfferDetailsOpen(false);
    } catch (error) {
      console.error("Error rejecting exchange offer:", error);
      toast.error("Failed to reject exchange offer");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Exchange Offers</h2>
      
      {loading ? (
        <p>Loading exchange offers...</p>
      ) : exchangeOffers.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">You have no exchange offers yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exchangeOffers.map((offer) => (
            <Card key={offer._id} className="overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Exchange Offer for: {offer.productId?.title || "Product"}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="mb-2"><strong>Offered Item:</strong> {offer.exchangeOffer.eTitle}</p>
                <p className="mb-2 truncate"><strong>From:</strong> {offer.userEmail}</p>
                <p className="mb-4 line-clamp-2"><strong>Description:</strong> {offer.exchangeOffer.eDescription}</p>
                <Button className="w-full text-white" onClick={() => handleViewDetails(offer)}>
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Offer Details Dialog */}
      <Dialog open={offerDetailsOpen} onOpenChange={setOfferDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exchange Offer Details</DialogTitle>
          </DialogHeader>
          
          {selectedOffer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold">Your Product</h3>
                  {selectedOffer.productId?.image && (
                    <img 
                      src={selectedOffer.productId.image} 
                      alt={selectedOffer.productId.title || "Product"} 
                      className="w-full h-40 object-cover rounded-md my-2"
                    />
                  )}
                  <p>{selectedOffer.productId?.title || "Unknown Product"}</p>
                </div>
                
                <div>
                  <h3 className="font-bold">Offered Exchange</h3>
                  <div className="border rounded-md p-3 my-2 h-40 flex items-center justify-center bg-gray-100">
                    <p className="text-center text-gray-500">Exchange Item</p>
                  </div>
                  <p>{selectedOffer.exchangeOffer.eTitle}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold">Description</h3>
                <p className="text-muted-foreground">{selectedOffer.exchangeOffer.eDescription}</p>
              </div>
              
              {selectedOffer.exchangeOffer.eCondition && (
                <div>
                  <h3 className="font-bold">Condition</h3>
                  <p className="text-muted-foreground">{selectedOffer.exchangeOffer.eCondition}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-bold">Contact</h3>
                <p className="text-muted-foreground">{selectedOffer.userEmail}</p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleRejectOffer(selectedOffer._id)}
                >
                  Reject
                </Button>
                <Button 
                  className="flex-1 text-white"
                  onClick={() => handleAcceptOffer(selectedOffer._id)}
                >
                  Accept
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SellerExchangeOffers;
