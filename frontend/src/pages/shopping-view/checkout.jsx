import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function Checkout() {
  const [activeTab, setActiveTab] = useState("bid"); // Default to bid checkout
  const [acceptedExchanges, setAcceptedExchanges] = useState([]);
  const [userExchanges, setUserExchanges] = useState([]);
  const [bidDetails, setBidDetails] = useState(null);
  const [cartItems, setCartItems] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [selectedExchange, setSelectedExchange] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [selectedBidItem, setSelectedBidItem] = useState(null);
  const [showBidModal, setShowBidModal] = useState(false);

  // Get logged-in user's email from Redux store
  const { user } = useSelector((state) => state.auth);
  const email = user?.email; 

  useEffect(() => {
    if (!email) return;

    // Fetch cart items (auction wins)
    const fetchCartItems = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/shop/products/cart/${email}`);
        const data = await response.json();
        setCartItems(data.data || []);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    // Fetch exchanges where user is the seller
    const fetchSellerExchanges = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/shop/products/exchangeOffers/${email}`);
        const data = await response.json();
        // Filter for accepted exchanges only
        const accepted = data.data.filter(offer => offer.offerStatus === "accepted");
        setAcceptedExchanges(accepted);
      } catch (error) {
        console.error("Error fetching seller exchanges:", error);
      }
    };

    // Fetch exchanges where user made the offer
    const fetchUserExchanges = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/shop/products/exchangeOffers/user/${email}`);
        const data = await response.json();
        // Filter for accepted exchanges only
        const accepted = data.data.filter(offer => offer.offerStatus === "accepted");
        setUserExchanges(accepted);
      } catch (error) {
        console.error("Error fetching user exchanges:", error);
      } finally {
        setLoading(false);
      }
    };

    Promise.all([fetchCartItems(), fetchSellerExchanges(), fetchUserExchanges()]);
  }, [email]);


  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>

      {/* Tabs for Bid and Exchange Checkout */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex bg-gray-200 p-1 rounded-lg">
          <TabsTrigger value="bid" className="flex-1">Bid Checkout</TabsTrigger>
          <TabsTrigger value="exchange" className="flex-1">Exchange Checkout</TabsTrigger>
        </TabsList>

        {/* Bid Checkout with Cart Logic */}
        <TabsContent value="bid">
          <Card className="mt-4">
            <CardHeader>
              <h3 className="text-lg font-bold">Bid Checkout</h3>
            </CardHeader>
            <CardContent>
              {cartItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {cartItems.map((item) => (
                    <div key={item._id} className="border rounded-lg p-4">
                      <img src={item.image} alt={item.title} className="w-full h-32 object-cover rounded-md" />
                      <h4 className="text-lg font-semibold mt-2">{item.title}</h4>
                      <p className="text-gray-600">Seller: {item.seller}</p>
                      <p className="text-gray-700 font-bold">Rs. {item.currentBid}</p>
                      <Button 
                        className="mt-4 w-full text-white"
                        onClick={() => {
                          setSelectedBidItem(item);
                          setShowBidModal(true);
                        }}
                      >
                        Proceed to Payment
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No bid items in your cart.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Model for Bidding */}
        {showBidModal && selectedBidItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
              <h3 className="text-xl font-bold mb-4">Bid Checkout</h3>

              <div className="border rounded-lg p-4 mb-4">
                <img 
                  src={selectedBidItem.image} 
                  alt={selectedBidItem.title} 
                  className="w-full h-40 object-cover rounded" 
                />
                <h4 className="text-lg font-semibold mt-2">{selectedBidItem.title}</h4>
                <p className="text-gray-600">Seller: {selectedBidItem.seller}</p>
                <p className="text-gray-700 font-bold">Rs. {selectedBidItem.currentBid}</p>
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <Button variant="outline" onClick={() => setShowBidModal(false)}>Cancel</Button>
                <Button className="text-white">Pay</Button>
              </div>
            </div>
          </div>
        )}


        {/* Exchange Checkout */}
        <TabsContent value="exchange">
          <Card className="mt-4">
            <CardHeader>
              <h3 className="text-lg font-bold">Exchange Checkout</h3>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading exchanges...</p>
              ) : (
                <>
                  {/* Exchanges where you are the seller */}
                  {acceptedExchanges.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold mb-2">Books You're Exchanging</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {acceptedExchanges.map((exchange) => (
                          <div key={exchange._id} className="border rounded-lg p-4">
                            <div className="flex gap-4">
                              <div className="w-1/2">
                                <h5 className="font-semibold">Your Book</h5>
                                <div className="border rounded p-2 my-2 bg-gray-100 h-32 flex items-center justify-center">
                                  {exchange.productId?.image ? (
                                    <img 
                                      src={exchange.productId.image} 
                                      alt={exchange.productId.title}
                                      className="max-h-full max-w-full object-contain" 
                                    />
                                  ) : (
                                    <p className="text-center text-gray-500">Book Image</p>
                                  )}
                                </div>
                                <p>{exchange.productId?.title || "Product"}</p>
                              </div>
                              <div className="w-1/2">
                                <h5 className="font-semibold">You'll Receive</h5>
                                <div className="border rounded p-2 my-2 bg-gray-100 h-32 flex items-center justify-center">
                                  <p className="text-center text-gray-500">Exchange Item</p>
                                </div>
                                <p>{exchange.exchangeOffer.eTitle}</p>
                              </div>
                            </div>
                            <div className="mt-2 text-sm">
                              <p><span className="font-semibold">Status:</span> <span className="text-green-600">Accepted</span></p>
                              <p><span className="font-semibold">Contact:</span> {exchange.userEmail}</p>
                            </div>
                            <Button className="mt-4 w-full text-white">View Exchange</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exchanges where you are the offerer */}
                  {userExchanges.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold mb-2">Books You're Receiving</h4>
                      <div className="grid grid-cols-1 gap-4">
                      {userExchanges.map((exchange) => (
                        <div key={exchange._id} className="border rounded-lg p-4">
                          <div className="flex gap-4">
                            <div className="w-1/2">
                              <h5 className="font-semibold">You'll Receive</h5>
                              <div className="border rounded p-2 my-2 bg-gray-100 h-32 flex items-center justify-center">
                                {exchange.productId?.image ? (
                                  <img 
                                    src={exchange.productId.image} 
                                    alt={exchange.productId.title}
                                    className="max-h-full max-w-full object-contain" 
                                  />
                                ) : (
                                  <p className="text-center text-gray-500">Book Image</p>
                                )}
                              </div>
                              <p>{exchange.productId?.title || "Product"}</p>
                            </div>
                            <div className="w-1/2">
                              <h5 className="font-semibold">Your Book</h5>
                              <div className="border rounded p-2 my-2 bg-gray-100 h-32 flex items-center justify-center">
                                <p className="text-center text-gray-500">Your Exchange Item</p>
                              </div>
                              <p>{exchange.exchangeOffer.eTitle}</p>
                            </div>
                          </div>

                          <div className="mt-2 text-sm">
                            <p><span className="font-semibold">Status:</span> <span className="text-green-600">Accepted</span></p>
                            <p><span className="font-semibold">Contact Seller:</span> Check product details</p>
                          </div>

                          <Button 
                            className="mt-4 w-full text-white"
                            onClick={() => {
                              setSelectedExchange(exchange);
                              setShowModal(true);
                            }}
                          >
                            Arrange Exchange
                          </Button>
                        </div>
                      ))}

                        {/* Popup Modal */}
                        {showModal && selectedExchange && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
                              <h3 className="text-xl font-bold mb-4">Exchange Details</h3>
                              
                              <div className="flex gap-4">
                                <div className="w-1/2">
                                  <p className="font-semibold">You'll Receive:</p>
                                  <div className="border rounded p-2 my-2 bg-gray-100 h-32 flex items-center justify-center">
                                    {selectedExchange.productId?.image ? (
                                      <img 
                                        src={selectedExchange.productId.image} 
                                        alt={selectedExchange.productId.title}
                                        className="max-h-full max-w-full object-contain" 
                                      />
                                    ) : (
                                      <p className="text-gray-500">Image</p>
                                    )}
                                  </div>
                                  <p>{selectedExchange.productId?.title}</p>
                                </div>
                                <div className="w-1/2">
                                  <p className="font-semibold">Your Book:</p>
                                  <div className="border rounded p-2 my-2 bg-gray-100 h-32 flex items-center justify-center">
                                    <p className="text-gray-500 text-center">{selectedExchange.exchangeOffer?.eTitle}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4">
                                <p><span className="font-semibold">Status:</span> Accepted</p>
                                <p><span className="font-semibold">Seller Contact:</span> {selectedExchange.productId?.sellerEmail || "N/A"}</p>
                              </div>

                              <div className="flex justify-end gap-4 mt-6">
                                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button className="text-white">Pay</Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {acceptedExchanges.length === 0 && userExchanges.length === 0 && (
                    <p className="text-muted-foreground">No accepted exchanges found.</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Checkout;