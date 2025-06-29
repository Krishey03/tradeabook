import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import api from "@/api/axios"
import { BookOpen, Loader2, Truck, ShieldCheck, MessageCircle, ArrowRight, CreditCard, RefreshCw } from "lucide-react"

function Checkout(productDetails) {
  const [activeTab, setActiveTab] = useState("bid")
  const [acceptedExchanges, setAcceptedExchanges] = useState([])
  const [userExchanges, setUserExchanges] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [selectedBidItem, setSelectedBidItem] = useState(null)
  const [showBidSidebar, setShowBidSidebar] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { user } = useSelector((state) => state.auth)
  const email = user?.email

  const fetchWithHandling = async (url) => {
    try {
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error("API error:", error)
      
      if (error.response && 
          error.response.headers['content-type'].includes('text/html')) {
        console.error("Received HTML response")
      }
      
      return { data: [] }
    }
  }

  useEffect(() => {
    if (!email) return

    const fetchCartItems = async () => {
      const data = await fetchWithHandling(`/shop/products/cart/${email}`)
      setCartItems(data.data || [])
    }

    const fetchSellerExchanges = async () => {
      const data = await fetchWithHandling(`/shop/products/exchangeOffers/${email}`)
      const accepted = data.data?.filter(offer => offer.offerStatus === "accepted") || []
      setAcceptedExchanges(accepted)
    }

    const fetchUserExchanges = async () => {
      const data = await fetchWithHandling(`/shop/products/exchangeOffers/user/${email}`)
      const accepted = data.data?.filter(offer => offer.offerStatus === "accepted") || []
      setUserExchanges(accepted)
      setLoading(false)
    }

    Promise.all([fetchCartItems(), fetchSellerExchanges(), fetchUserExchanges()])
  }, [email])

  const handleBidPayment = async (product) => {
    try {
      setPaymentLoading(true)
      const response = await api.post("/initialize-product-payment", {
        productId: product._id,
        productType: "Product",
        website_url: window.location.origin,
      })

      if (response.data.success && response.data.payment.payment_url) {
        window.location.href = response.data.payment.payment_url
      } else {
        alert("Could not initialize payment. Please try again.")
      }
    } catch (error) {
      console.error("Payment initialization failed:", error)
      alert("Payment initialization failed. Please try again later.")
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleExchangePayment = async (exchange) => {
    try {
      setPaymentLoading(true)
      const response = await api.post("/initialize-product-payment", {
        productId: exchange._id,
        productType: "eProduct",
        website_url: window.location.origin,
      })

      if (response.data.success && response.data.payment.payment_url) {
        window.location.href = response.data.payment.payment_url
      } else {
        alert("Could not initialize exchange payment. Please try again.")
      }
    } catch (error) {
      console.error("Exchange payment initialization failed:", error)
      alert("Exchange payment initialization failed. Please try again later.")
    } finally {
      setPaymentLoading(false)
    }
  }

  const openWhatsApp = (phoneNumber, message) => {
    if (!phoneNumber) return
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank")
  }

  // Filter functions
  const filteredCartItems = cartItems.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAcceptedExchanges = acceptedExchanges.filter(exchange => 
    exchange.productId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exchange.exchangeOffer?.eTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUserExchanges = userExchanges.filter(exchange => 
    exchange.productId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exchange.exchangeOffer?.eTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3 pt-[88px] md:pt-[72px]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-slate-600">Loading your orders...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Fixed Header */}
      <div className="fixed md:top-[56px] left-0 right-0 z-40 bg-white shadow-sm h-[72px] md:h-[64px] border-t">
        <div className="container mx-auto px-4 pt-[10px] md:pt-[10px] pb-6">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between h-full">
            {/* Heading alone */}
            <h2 className="text-center text-2xl font-semibold mb-6 sm:mb-0">
              Checkout
            </h2>

            {/* Group tabs + search together */}
            <div className="flex items-center gap-4">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "bid"
                      ? "bg-white shadow text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("bid")}
                >
                  Winning Bids
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "exchange"
                      ? "bg-white shadow text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("exchange")}
                >
                  Book Exchanges
                </button>
              </div>

              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search your purchases..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex flex-col justify-center h-full py-1">
            <div className="relative mb-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search purchases..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex justify-center">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "bid"
                      ? "bg-white shadow text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("bid")}
                >
                  Bids
                </button>
                <button
                  className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "exchange"
                      ? "bg-white shadow text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("exchange")}
                >
                  Exchanges
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-[88px] pb-6 md:pt-[72px]">
        {activeTab === "bid" ? (
          <Card className="border-0 rounded-xl shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b px-6 py-5">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-teal-500" />
                Your Winning Bids
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              {filteredCartItems.length > 0 ? (
                <div className="divide-y">
                  {filteredCartItems.map((item) => (
                    <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border bg-gray-100">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                              <p className="text-gray-600 text-sm mt-1">Seller: {item.seller}</p>
                              <Badge variant="outline" className="mt-2 bg-teal-50 text-teal-700 border-teal-200">
                                Winning Bid
                              </Badge>
                            </div>
                            <p className="text-teal-600 font-bold text-xl md:text-right">Rs. {item.currentBid}</p>
                          </div>

                          <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
                            <Button
                              variant="outline"
                              className="w-full sm:w-auto border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 gap-2"
                              onClick={() => {
                                openWhatsApp(item?.sellerPhone, `Hello, I'm interested in your book: ${item.title}`)
                              }}
                            >
                              <MessageCircle className="w-4 h-4" />
                              Chat with Seller
                            </Button>
                            <Button
                              className="w-full sm:w-auto bg-black:400 hover:bg-teal-700 text-white gap-2"
                              onClick={() => {
                                setSelectedBidItem(item)
                                setShowBidSidebar(true)
                              }}
                            >
                              Proceed to Payment
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-gray-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-700 text-lg font-medium">No winning bids to checkout</p>
                  <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    {searchQuery ? "No matching bids found" : "Your winning auction items will appear here once you've won a bid"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 rounded-xl shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b px-6 py-5">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-teal-500" />
                Accepted Exchanges
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-teal-500 mb-4" />
                    <p className="text-gray-500">Loading your exchanges...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Exchanges where you are the seller */}
                  {filteredAcceptedExchanges.length > 0 && (
                    <div className="p-6">
                      <h4 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                        Books You're Exchanging
                      </h4>
                      <div className="space-y-6">
                        {filteredAcceptedExchanges.map((exchange) => (
                          <div
                            key={exchange._id}
                            className="border border-gray-200 rounded-xl p-6 hover:border-teal-200 transition-colors"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                              <div className="space-y-3">
                                <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                                  <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full">
                                    Your Book
                                  </span>
                                </h5>
                                <div className="border rounded-lg p-4 bg-gray-50 h-48 flex items-center justify-center">
                                  {exchange.productId?.image ? (
                                    <img
                                      src={exchange.productId.image || "/placeholder.svg"}
                                      alt={exchange.productId.title}
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  ) : (
                                    <BookOpen className="h-10 w-10 text-gray-400" />
                                  )}
                                </div>
                                <p className="font-medium text-gray-800">{exchange.productId?.title || "Product"}</p>
                              </div>
                              <div className="space-y-3">
                                <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                                  <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full">
                                    You'll Receive
                                  </span>
                                </h5>
                                <div className="border rounded-lg p-4 bg-gray-50 h-48 flex items-center justify-center">
                                  {exchange.exchangeOffer?.eImage ? (
                                    <img
                                      src={exchange.exchangeOffer.eImage || "/placeholder.svg"}
                                      alt={exchange.exchangeOffer.eTitle}
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  ) : (
                                    <BookOpen className="h-10 w-10 text-gray-400" />
                                  )}
                                </div>
                                <p className="font-medium text-gray-800">{exchange.exchangeOffer.eTitle}</p>
                              </div>
                            </div>
                            <Separator className="my-4" />
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                              <div className="text-sm space-y-2 text-gray-600">
                                <p className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Accepted
                                  </Badge>
                                  <span>Exchange has been approved</span>
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                className="w-full sm:w-auto border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 gap-2"
                                onClick={() => {
                                  openWhatsApp(
                                    exchange.exchangeOffer.eBuyerPhone,
                                    `Hello, about our book exchange: ${exchange.exchangeOffer.eTitle}`,
                                  )
                                }}
                              >
                                <MessageCircle className="w-4 h-4" />
                                Chat with Buyer
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exchanges where you are the offerer */}
                  {filteredUserExchanges.length > 0 && (
                    <div className="p-6">
                      <h4 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                          Incoming
                        </Badge>
                        Books You're Receiving
                      </h4>
                      <div className="space-y-6">
                        {filteredUserExchanges.map((exchange) => (
                          <div
                            key={exchange._id}
                            className="border border-gray-200 rounded-xl p-6 hover:border-teal-200 transition-colors"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                              <div className="space-y-3">
                                <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                                  <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full">
                                    You'll Receive
                                  </span>
                                </h5>
                                <div className="border rounded-lg p-4 bg-gray-50 h-48 flex items-center justify-center">
                                  {exchange.productId?.image ? (
                                    <img
                                      src={exchange.productId.image || "/placeholder.svg"}
                                      alt={exchange.productId.title}
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  ) : (
                                    <BookOpen className="h-10 w-10 text-gray-400" />
                                  )}
                                </div>
                                <p className="font-medium text-gray-800">{exchange.productId?.title || "Product"}</p>
                              </div>
                              <div className="space-y-3">
                                <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                                  <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full">
                                    Your Book
                                  </span>
                                </h5>
                                <div className="border rounded-lg p-4 bg-gray-50 h-48 flex items-center justify-center">
                                  {exchange.exchangeOffer?.eImage ? (
                                    <img
                                      src={exchange.exchangeOffer.eImage || "/placeholder.svg"}
                                      alt={exchange.exchangeOffer.eTitle}
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  ) : (
                                    <BookOpen className="h-10 w-10 text-gray-400" />
                                  )}
                                </div>
                                <p className="font-medium text-gray-800">{exchange.exchangeOffer.eTitle}</p>
                              </div>
                            </div>
                            <Separator className="my-4" />
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                              <div className="text-sm space-y-2 text-gray-600">
                                <p className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Accepted
                                  </Badge>
                                  <span>Exchange has been approved</span>
                                </p>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <Button
                                  variant="outline"
                                  className="w-full sm:w-auto border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 gap-2"
                                  onClick={() => {
                                    openWhatsApp(
                                      exchange.productId?.sellerPhone,
                                      `Hello, about our book exchange: ${exchange.productId?.title}`,
                                    )
                                  }}
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Chat with Seller
                                </Button>
                                <Button
                                  className="w-full sm:w-auto bg-black:400 hover:bg-teal-700 text-white gap-2"
                                  onClick={() => {
                                    setSelectedExchange(exchange)
                                    setShowSidebar(true)
                                  }}
                                >
                                  Pay Exchange Fee
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredAcceptedExchanges.length === 0 && filteredUserExchanges.length === 0 && (
                    <div className="text-center py-16">
                      <div className="bg-gray-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <RefreshCw className="h-10 w-10 text-gray-400" />
                      </div>
                      <p className="text-gray-700 text-lg font-medium">
                        {searchQuery ? "No matching exchanges found" : "No accepted exchanges found"}
                      </p>
                      <p className="text-gray-500 mt-2 max-w-md mx-auto">
                        {searchQuery ? "" : "Your accepted exchange offers will appear here once approved"}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Bid Payment Sheet */}
        <Sheet open={showBidSidebar} onOpenChange={setShowBidSidebar}>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold text-gray-900">Order Summary</SheetTitle>
            </SheetHeader>

            {selectedBidItem && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border bg-gray-100">
                    <img
                      src={selectedBidItem.image || "/placeholder.svg"}
                      alt={selectedBidItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{selectedBidItem.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">Seller: {selectedBidItem.seller}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Payment Details</h4>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Winning Bid Amount</span>
                      <span className="font-medium">Rs. {selectedBidItem.currentBid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        Delivery Fee
                      </span>
                      <span className="font-medium">Rs. 25</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4" />
                        Service Fee
                      </span>
                      <span className="font-medium">Rs. 5</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Amount</span>
                      <span className="text-teal-600">Rs. {selectedBidItem.currentBid + 30}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-lg"
                    disabled={paymentLoading}
                    onClick={() => handleBidPayment(selectedBidItem)}
                  >
                    {paymentLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing Payment...
                      </span>
                    ) : (
                      "Pay with Khalti"
                    )}
                  </Button>
                  <p className="mt-3 text-sm text-gray-500 text-center">
                    By completing your purchase, you agree to our Terms of Service
                  </p>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Exchange Payment Sheet */}
        <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold text-gray-900">Exchange Fee</SheetTitle>
            </SheetHeader>

            {selectedExchange && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="font-semibold text-sm text-gray-700">You'll Receive</h5>
                    <div className="border rounded-lg p-3 bg-gray-50 h-40 flex items-center justify-center">
                      {selectedExchange.productId?.image ? (
                        <img
                          src={selectedExchange.productId.image || "/placeholder.svg"}
                          alt={selectedExchange.productId.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <BookOpen className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-700 truncate">{selectedExchange.productId?.title || "Product"}</p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-semibold text-sm text-gray-700">Your Book</h5>
                    <div className="border rounded-lg p-3 bg-gray-50 h-40 flex items-center justify-center">
                      {selectedExchange.exchangeOffer?.eImage ? (
                        <img
                          src={selectedExchange.exchangeOffer.eImage || "/placeholder.svg"}
                          alt={selectedExchange.exchangeOffer.eTitle}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <BookOpen className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-700 truncate">{selectedExchange.exchangeOffer?.eTitle}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Fee Details</h4>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        Delivery Fee
                      </span>
                      <span className="font-medium">Rs. 50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4" />
                        Service Fee
                      </span>
                      <span className="font-medium">Rs. 5</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Amount</span>
                      <span className="text-teal-600">Rs. 55</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-lg"
                    disabled={paymentLoading}
                    onClick={() => handleExchangePayment(selectedExchange)}
                  >
                    {paymentLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing Payment...
                      </span>
                    ) : (
                      "Pay with Khalti"
                    )}
                  </Button>
                  <p className="mt-3 text-sm text-gray-500 text-center">
                    A small fee helps us maintain the platform and ensure secure exchanges
                  </p>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

export default Checkout