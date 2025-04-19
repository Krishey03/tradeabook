import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import useExchangeOffers from "@/hooks/useExchangeOffers";

const isAcceptDisabled = (product) => {
  if (!product) return false;
  const biddingEnded = new Date(product.endTime) < new Date();
  const hasBids = !!product.bidderEmail;
  return biddingEnded && hasBids;
};

function SellerExchangeOffers() {
  const userEmail = useSelector((state) => state.auth.user?.email);

  const {
    incomingOffers, 
    outgoingOffers, 
    loading,
    selectedOffer,
    offerDetailsOpen,
    handleViewDetails,
    handleAcceptOffer,
    handleRejectOffer,
    setOfferDetailsOpen,
  } = useExchangeOffers(userEmail);

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
          {incomingOffers.map((offer) => {
            const disabled = isAcceptDisabled(offer.productId);
            
            return (
              offer.offerStatus !== "declined" && offer.offerStatus !== "accepted" && (
                <Card key={offer._id} className="overflow-hidden relative">
                  {disabled && (
                    <div className="absolute top-2 right-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                      Auction Closed
                    </div>
                  )}
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">
                      Exchange Offer for: {offer.productId?.title || "Product"}
                      {disabled && " (Closed)"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="mb-2"><strong>Offered Item:</strong> {offer.exchangeOffer.eTitle}</p>
                    <p className="mb-2 truncate"><strong>From:</strong> {offer.userEmail}</p>
                    <p className="mb-4 line-clamp-2"><strong>Description:</strong> {offer.exchangeOffer.eDescription}</p>
                    <Button 
                      className="w-full text-white" 
                      onClick={() => handleViewDetails(offer)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              )
            );
          })}
        </div>
      )}

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
                  {selectedOffer.exchangeOffer.eImage && (
                    <img
                      src={selectedOffer.exchangeOffer.eImage}
                      alt={selectedOffer.exchangeOffer.eTitle || "Exchange item"}
                      className="w-full h-40 object-cover rounded-md my-2"
                    />
                  )}
                  <div className="mt-2">
                    <p className="font-medium">{selectedOffer.exchangeOffer.eTitle}</p>
                  </div>
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

              <div className="flex gap-2 pt-4 flex-col">
                {isAcceptDisabled(selectedOffer.productId) ? (
                  <div className="text-red-600 text-sm text-center">
                    This offer can't be accepted - auction ended with winning bid
                  </div>
                ) : (
                  <div className="flex gap-2">
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
                      disabled={isAcceptDisabled(selectedOffer.productId)}
                    >
                      Accept
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SellerExchangeOffers;