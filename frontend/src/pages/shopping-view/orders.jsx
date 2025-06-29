import { useEffect, useState } from "react"
import api from "@/api/axios"
import { useSelector } from "react-redux"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Loader2,
  Calendar,
  CreditCard,
  ArrowLeftRight,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react"

function UserOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("auction")
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!user?.email) {
          throw new Error("Authentication required")
        }

        const response = await api.get(`/shop/products/orders/${user.email}`)

        if (!response.data?.success) {
          throw new Error(response.data?.message || "Invalid response format")
        }

        const formattedOrders = (response.data.data || []).map((order) => ({
          ...order,
          productType: order.productType || (order.product?.bidderEmail ? "Product" : "eProduct"),
          product: {
            ...order.product,
            title: order.product?.title || "No title available",
            image: order.product?.image || "",
            exchangeOffer: order.product?.exchangeOffer || {
              eTitle: "Your offered book",
              eImage: "",
              eBuyerPhone: "",
            },
          },
        }))

        setOrders(formattedOrders)
      } catch (err) {
        console.error("Fetch Error:", {
          message: err.message,
          response: err.response?.data,
        })
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user?.email])

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => 
    order.product?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.product?.exchangeOffer?.eTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Categorize orders
  const auctionOrders = filteredOrders.filter(
    (order) =>
      order.productType === "Product" || (order.product && (order.product.bidderEmail || order.product.winnerEmail)),
  )

  const exchangeOrders = filteredOrders.filter(
    (order) => order.productType === "eProduct" || (order.product && order.product.userEmail),
  )

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3 pt-[88px] md:pt-[72px]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-slate-600">Loading your orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 max-w-2xl mx-auto flex flex-col items-center pt-[88px] md:pt-[72px]">
        <AlertCircle className="h-10 w-10 mb-3 text-rose-500" />
        <p className="font-medium mb-1">Unable to load your orders</p>
        <p className="text-sm mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="flex items-center gap-2" variant="outline">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Fixed Header */}
      <div className="fixed top-[64px] md:top-[56px] left-0 right-0 z-40 bg-white shadow-sm h-[72px] md:h-[64px] border-t">
        <div className="container mx-auto px-4 pt-[10px] md:pt-[10px] pb-6">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between h-full">
            {/* Heading alone */}
            <h2 className="text-center text-2xl font-semibold mb-6 sm:mb-0">
              Your Purchases
            </h2>

            {/* Group tabs + search together */}
            <div className="flex items-center gap-4">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "auction"
                      ? "bg-white shadow text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("auction")}
                >
                  Auction Orders
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "exchange"
                      ? "bg-white shadow text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("exchange")}
                >
                  Exchange Orders
                </button>
              </div>

              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search your products..."
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
                placeholder="Search products..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex justify-center">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "auction"
                      ? "bg-white shadow text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("auction")}
                >
                  Auction
                </button>
                <button
                  className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "exchange"
                      ? "bg-white shadow text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("exchange")}
                >
                  Exchange
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-[88px] pb-6 md:pt-[72px]">
        {activeTab === "auction" ? (
          auctionOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
              <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-10 w-10 text-slate-400" />
              </div>
              <CardTitle className="text-xl font-medium text-slate-800 mb-2">No auction orders found</CardTitle>
              <CardDescription className="max-w-md mx-auto text-slate-500">
                Your winning bids will appear here for easy tracking and management.
              </CardDescription>
              <Button className="mt-6 text-white" onClick={() => (window.location.href = "/shop/listing")}>
                Browse Listings
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {auctionOrders.map((order) => (
                <Card key={order.paymentId} className="overflow-hidden border-slate-200 transition-all hover:shadow-md">
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    {order.product?.image ? (
                      <img
                        src={order.product.image || "/placeholder.svg"}
                        alt={order.product.title}
                        className="h-full w-full object-cover transition-transform"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BookOpen className="h-16 w-16 text-slate-300" />
                      </div>
                    )}
                    <Badge
                      className={`absolute top-3 right-3 ${
                        order.status === "completed"
                          ? "bg-emerald-500 hover:bg-emerald-600"
                          : "bg-amber-500 hover:bg-amber-600"
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </div>

                  <CardContent className="p-5">
                    <h3 className="mb-3 line-clamp-2 text-lg font-semibold text-slate-800">{order.product?.title}</h3>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-slate-600">
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span>Amount</span>
                        </div>
                        <span className="font-medium text-slate-900">Rs. {order.amount?.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-slate-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Purchase Date</span>
                        </div>
                        <span className="text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          exchangeOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
              <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowLeftRight className="h-10 w-10 text-slate-400" />
              </div>
              <CardTitle className="text-xl font-medium text-slate-800 mb-2">No exchange orders found</CardTitle>
              <CardDescription className="max-w-md mx-auto text-slate-500">
                When you exchange books with other users, your completed exchanges will appear here for tracking.
              </CardDescription>
              <Button className="mt-6 text-white" onClick={() => (window.location.href = "/shop/listing")}>
                Browse Listings
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {exchangeOrders.map((order) => {
                const receivedProduct = order.product?.productId || {}
                const offeredProduct = order.product?.exchangeOffer || {}

                return (
                  <Card key={order.paymentId} className="border-slate-200 overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 p-5">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-slate-800">Exchange Details</CardTitle>
                        <Badge className="bg-emerald-500 hover:bg-emerald-600">Completed</Badge>
                      </div>
                      <CardDescription className="text-slate-500">
                        Completed on {new Date(order.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-5">
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Book You're Receiving */}
                        <div className="space-y-3">
                          <h5 className="flex items-center font-medium text-slate-700">
                            <ShoppingBag className="mr-2 h-4 w-4 text-emerald-500" />
                            You Received
                          </h5>
                          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                            <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center">
                              {receivedProduct.image ? (
                                <img
                                  src={receivedProduct.image || "/placeholder.svg"}
                                  alt={receivedProduct.title || "Received book"}
                                  className="h-full w-full object-contain p-4"
                                />
                              ) : (
                                <BookOpen className="h-16 w-16 text-slate-300" />
                              )}
                            </div>
                            <div className="p-3">
                              <p className="font-medium text-slate-800 line-clamp-1">
                                {receivedProduct.title || "Title not provided"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Your Book */}
                        <div className="space-y-3">
                          <h5 className="flex items-center font-medium text-slate-700">
                            <ArrowLeftRight className="mr-2 h-4 w-4 text-blue-500" />
                            Your Book
                          </h5>
                          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                            <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center">
                              {offeredProduct.eImage ? (
                                <img
                                  src={offeredProduct.eImage || "/placeholder.svg"}
                                  alt={offeredProduct.eTitle || "Your offered book"}
                                  className="h-full w-full object-contain p-4"
                                />
                              ) : (
                                <BookOpen className="h-16 w-16 text-slate-300" />
                              )}
                            </div>
                            <div className="p-3">
                              <p className="font-medium text-slate-800 line-clamp-1">
                                {offeredProduct.eTitle || "Your offered book"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Exchange details */}
                      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500">Exchange Fee</p>
                            <p className="font-medium text-slate-800">Rs. {order.amount?.toFixed(2)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500">Transaction ID</p>
                            <p className="font-medium text-slate-800 text-sm truncate">{order.paymentId || "N/A"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500">Exchange Date</p>
                            <p className="font-medium text-slate-800">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default UserOrders