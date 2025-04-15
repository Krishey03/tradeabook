import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import useExchangeOffers from "@/hooks/useExchangeOffers";

function SellerExchangeOffers() {
  const userEmail = useSelector((state) => state.auth.user?.email);

  const {
    incomingOffers, // Changed from exchangeOffers to incomingOffers
    outgoingOffers, // You might want to use this too
    loading,
    selectedOffer,
    offerDetailsOpen,
    handleViewDetails,
    handleAcceptOffer,
    handleRejectOffer,
    setOfferDetailsOpen,
  } = useExchangeOffers(userEmail);

  // Determine if we're still loading
  const isLoading = loading.incoming || loading.outgoing;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Exchange Offers</h2>

      {isLoading ? (
        <p>Loading exchange offers...</p>
      ) : incomingOffers.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">You have no exchange offers yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {incomingOffers.map(
            (offer) =>
              offer.offerStatus !== "declined" && offer.offerStatus !== "accepted" && (
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
              )
          )}
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