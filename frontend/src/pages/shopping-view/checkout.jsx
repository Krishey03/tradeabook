import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios"; // Make sure axios is installed
import { BookOpen, Loader2 } from "lucide-react";
import { ChatIcon } from "@heroicons/react/outline";

function Checkout(productDetails) {
  const [activeTab, setActiveTab] = useState("bid"); // Default to bid checkout
  const [acceptedExchanges, setAcceptedExchanges] = useState([]);
  const [userExchanges, setUserExchanges] = useState([]);
  const [bidDetails, setBidDetails] = useState(null);
  const [cartItems, setCartItems] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

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

  // Function to handle bid payment
  const handleBidPayment = async (product) => {
    try {
      setPaymentLoading(true);
      const response = await axios.post('http://localhost:5000/api/initialize-product-payment', {
        productId: product._id,
        productType: 'Product',
        website_url: window.location.origin
      });
      
      if (response.data.success && response.data.payment.payment_url) {
        // Redirect to Khalti payment page
        window.location.href = response.data.payment.payment_url;
      } else {
        alert('Could not initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert('Payment initialization failed. Please try again later.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Function to handle exchange payment
  const handleExchangePayment = async (exchange) => {
    try {
      setPaymentLoading(true);
      const response = await axios.post('http://localhost:5000/api/initialize-product-payment', {
        productId: exchange._id,
        productType: 'eProduct',
        website_url: window.location.origin
      });
      
      if (response.data.success && response.data.payment.payment_url) {
        // Redirect to Khalti payment page
        window.location.href = response.data.payment.payment_url;
      } else {
        alert('Could not initialize exchange payment. Please try again.');
      }
    } catch (error) {
      console.error('Exchange payment initialization failed:', error);
      alert('Exchange payment initialization failed. Please try again later.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
  <h2 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h2>

  {/* Tabs for Bid and Exchange Checkout */}
  <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
  <TabsList className="flex w-full bg-gray-100 p-1 rounded-lg h-12 gap-2">
    <TabsTrigger 
      value="bid" 
      className="flex-1 h-full text-gray-600 font-medium bg-gray-100 rounded-md 
                 data-[state=active]:bg-white data-[state=active]:shadow-sm 
                 data-[state=active]:text-blue-600 transition-all"
    >
      Bid Checkout
    </TabsTrigger>
    <TabsTrigger 
      value="exchange" 
      className="flex-1 h-full text-gray-600 font-medium bg-gray-100 rounded-md 
                 data-[state=active]:bg-white data-[state=active]:shadow-sm 
                 data-[state=active]:text-blue-600 transition-all"
    >
      Exchange Checkout
    </TabsTrigger>
  </TabsList>

    {/* Bid Checkout with Cart Logic */}
    <TabsContent value="bid" className="mt-6">
      <Card className="w-[600px] border rounded-lg shadow-sm">
        <CardHeader className="border-b p-4">
          <CardTitle className="text-xl font-semibold text-gray-800">Bid Checkout</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {cartItems.length > 0 ? (
            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-4 items-start">
                    <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden border">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-lg font-semibold text-gray-800">{item.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">Seller: {item.seller}</p>
                      <div className="mt-2 flex justify-between items-center">
                      <p className="text-primary font-bold">Rs. {item.currentBid}</p>
                      <button
                            className={`px-6 py-3 rounded-lg font-nunito font-semibold text-white transition-all duration-300 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform'}
                            flex items-center justify-center h-[50px] w-[150px]`}
                            onClick={() => {
                              const phoneNumber = item?.sellerPhone;
                            if (!phoneNumber) {
                                console.log("Seller's phone number is not available.");
                                return;
                            }
                            const message = encodeURIComponent(`Hello, I'm interested in your book: ${productDetails?.title}`);
                            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
                            window.open(whatsappUrl, "_blank");
                            }}
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Chat
                        </button>
                    </div>

                    </div>
                  </div>
                  <Button 
                    className="mt-4 w-full bg-primary text-white hover:bg-primary-dark h-10"
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
            <div className="text-center py-12">
              <BookOpen className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No bid items in your cart.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>

    {/* Payment Modal for Bidding */}
    {showBidModal && selectedBidItem && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Bid Payment</h3>

          <div className="border rounded-lg p-4 mb-6">
            <div className="flex gap-4 items-center">
              <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border">
                <img 
                  src={selectedBidItem.image} 
                  alt={selectedBidItem.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">{selectedBidItem.title}</h4>
                <p className="text-gray-600 text-sm mt-1">Seller: {selectedBidItem.seller}</p>
                <p className="text-primary font-bold mt-1">Rs. {selectedBidItem.currentBid}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              className="h-10"
              onClick={() => setShowBidModal(false)}
            >
              Cancel
            </Button>
            <Button 
              className="h-10 bg-primary hover:bg-primary-dark"
              disabled={paymentLoading}
              onClick={() => handleBidPayment(selectedBidItem)}
            >
              {paymentLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : "Pay with Khalti"}
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* Exchange Checkout */}
    <TabsContent value="exchange" className="mt-6">
      <Card className="w-[600px] border rounded-lg shadow-sm">
        <CardHeader className="border-b p-4">
          <CardTitle className="text-xl font-semibold text-gray-800">Exchange Checkout</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Exchanges where you are the seller */}
              {acceptedExchanges.length > 0 && (
                <div className="mb-8 p-4">
                  <h4 className="text-lg font-semibold mb-4 pb-2 border-b text-gray-800">Books You're Exchanging</h4>
                  <div className="space-y-4">
                    {acceptedExchanges.map((exchange) => (
                      <div key={exchange._id} className="border rounded-lg p-4">
                        <div className="flex gap-4 mb-4">
                          <div className="w-1/2">
                            <h5 className="font-semibold mb-2 text-sm text-gray-700">Your Book</h5>
                            <div className="border rounded p-3 bg-gray-50 h-40 flex items-center justify-center">
                              {exchange.productId?.image ? (
                                <img 
                                  src={exchange.productId.image} 
                                  alt={exchange.productId.title}
                                  className="max-h-full max-w-full object-contain" 
                                />
                              ) : (
                                <BookOpen className="h-10 w-10 text-gray-400" />
                              )}
                            </div>
                            <p className="mt-2 text-sm text-gray-700 truncate">{exchange.productId?.title || "Product"}</p>
                          </div>
                          <div className="w-1/2">
                            <h5 className="font-semibold mb-2 text-sm text-gray-700">You'll Receive</h5>
                            <div className="border rounded p-3 bg-gray-50 h-40 flex items-center justify-center">
                              {exchange.exchangeOffer?.eImage ? (
                                <img 
                                  src={exchange.exchangeOffer.eImage} 
                                  alt={exchange.exchangeOffer.eTitle}
                                  className="max-h-full max-w-full object-contain" 
                                />
                              ) : (
                                <BookOpen className="h-10 w-10 text-gray-400" />
                              )}
                            </div>
                            <p className="mt-2 text-sm text-gray-700 truncate">{exchange.exchangeOffer.eTitle}</p>
                          </div>
                        </div>
                        <div className="mt-4 text-sm space-y-2 text-gray-600">
                          <p><span className="font-medium">Status:</span> <span className="text-green-600">Accepted</span></p>
                          <button
                            className={`px-6 py-3 rounded-lg font-nunito font-semibold text-white transition-all duration-300 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform'}
                            flex items-center justify-center h-[50px] w-[150px]`}
                            onClick={() => {
                              const phoneNumber = exchange.exchangeOffer.eBuyerPhone;
                            if (!phoneNumber) {
                                console.log("Seller's phone number is not available.");
                                return;
                            }
                            const message = encodeURIComponent(`Hello, I'm interested in your book: ${productDetails?.title}`);
                            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
                            window.open(whatsappUrl, "_blank");
                            }}
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Chat
                        </button>
                        </div>
                        <Button 
                          className="mt-4 w-full bg-primary text-white hover:bg-primary-dark h-10"
                          onClick={() => handleExchangePayment(exchange)}
                          disabled={paymentLoading}
                        >
                          {paymentLoading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </span>
                          ) : "Pay Exchange Fee (Rs.1) (remove the logic here)"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exchanges where you are the offerer */}
              {userExchanges.length > 0 && (
                <div className="p-4">
                  <h4 className="text-lg font-semibold mb-4 pb-2 border-b text-gray-800">Books You're Receiving</h4>
                  <div className="space-y-4">
                    {userExchanges.map((exchange) => (
                      <div key={exchange._id} className="border rounded-lg p-4">
                        <div className="flex gap-4 mb-4">
                          <div className="w-1/2">
                            <h5 className="font-semibold mb-2 text-sm text-gray-700">You'll Receive</h5>
                            <div className="border rounded p-3 bg-gray-50 h-40 flex items-center justify-center">
                              {exchange.productId?.image ? (
                                <img 
                                  src={exchange.productId.image} 
                                  alt={exchange.productId.title}
                                  className="max-h-full max-w-full object-contain" 
                                />
                              ) : (
                                <BookOpen className="h-10 w-10 text-gray-400" />
                              )}
                            </div>
                            <p className="mt-2 text-sm text-gray-700 truncate">{exchange.productId?.title || "Product"}</p>
                          </div>
                          <div className="w-1/2">
                            <h5 className="font-semibold mb-2 text-sm text-gray-700">Your Book</h5>
                            <div className="border rounded p-3 bg-gray-50 h-40 flex items-center justify-center">
                              {exchange.exchangeOffer?.eImage ? (
                                <img 
                                  src={exchange.exchangeOffer.eImage} 
                                  alt={exchange.exchangeOffer.eTitle}
                                  className="max-h-full max-w-full object-contain" 
                                />
                              ) : (
                                <BookOpen className="h-10 w-10 text-gray-400" />
                              )}
                            </div>
                            <p className="mt-2 text-sm text-gray-700 truncate">{exchange.exchangeOffer.eTitle}</p>
                          </div>
                        </div>

                        <div className="mt-4 text-sm space-y-2 text-gray-600">
                          <p><span className="font-medium">Status:</span> <span className="text-green-600">Accepted</span></p>
                          <Button
                                className="text-white font-nunito items-center h-[50px] w-[150px] justify-center"
                                onClick={() => {
                                const phoneNumber = productDetails?.sellerPhone; // Ensure this field is available
                                if (!phoneNumber) {
                                    toast.error("Seller's phone number is not available.");
                                    return;
                                }
                                const message = encodeURIComponent(`Hello, I'm interested in your book: ${productDetails?.title}`);
                                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
                                window.open(whatsappUrl, "_blank");
                                }}
                            >
                                <ChatIcon  /> {/* Chat Icon */}
                                Chat with seller
                            </Button>
                        </div>

                        <Button 
                          className="mt-4 w-full bg-primary text-white hover:bg-primary-dark h-10"
                          onClick={() => {
                            setSelectedExchange(exchange);
                            setShowModal(true);
                          }}
                        >
                          Pay Exchange Fee (Rs.100)
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {acceptedExchanges.length === 0 && userExchanges.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No accepted exchanges found.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>

  
      {/* Exchange Popup Modal */}
      {showModal && selectedExchange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4">Exchange Details</h3>
            
            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <p className="font-semibold mb-2 text-sm">You'll Receive:</p>
                <div className="border rounded p-2 bg-gray-50 h-40 flex items-center justify-center">
                  {selectedExchange.productId?.image ? (
                    <img 
                      src={selectedExchange.productId.image} 
                      alt={selectedExchange.productId.title}
                      className="max-h-full max-w-full object-contain" 
                    />
                  ) : (
                    <BookOpen className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <p className="mt-2 text-sm">{selectedExchange.productId?.title}</p>
              </div>
              <div className="w-1/2">
                <p className="font-semibold mb-2 text-sm">Your Book:</p>
                <div className="border rounded p-2 bg-gray-50 h-40 flex items-center justify-center">
                  {selectedExchange.exchangeOffer?.eImage ? (
                    <img 
                      src={selectedExchange.exchangeOffer.eImage} 
                      alt={selectedExchange.exchangeOffer.eTitle}
                      className="max-h-full max-w-full object-contain" 
                    />
                  ) : (
                    <BookOpen className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <p className="mt-2 text-sm">{selectedExchange.exchangeOffer?.eTitle}</p>
                
              </div>
            </div>
  
            <div className="mt-4 text-sm space-y-2">
              <p><span className="font-medium">Status:</span> Accepted</p>
              <p className="mt-2 text-gray-600 text-sm">
                A small delivery and service fee of Rs.1 is charged to complete the exchange process.
              </p>
            </div>
  
            <div className="flex justify-end gap-4 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-primary text-white hover:bg-primary-dark"
                disabled={paymentLoading}
                onClick={() => {
                  handleExchangePayment(selectedExchange);
                  setShowModal(false);
                }}
              >
                {paymentLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : "Pay with Khalti"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;