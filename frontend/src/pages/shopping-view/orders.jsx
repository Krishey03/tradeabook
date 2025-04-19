"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useSelector } from "react-redux"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Loader2,
  MessageSquare,
  Calendar,
  CreditCard,
  ArrowLeftRight,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
  ChevronRight,
} from "lucide-react"

function UserOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!user?.email) {
          throw new Error("Authentication required")
        }

        const response = await axios.get(`http://localhost:5000/api/shop/orders/${user.email}`)

        if (!response.data?.success) {
          throw new Error(response.data?.message || "Invalid response format")
        }

        // Transform data to ensure consistent structure
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

  // Categorize orders
  const auctionOrders = orders.filter(
    (order) =>
      order.productType === "Product" || (order.product && (order.product.bidderEmail || order.product.winnerEmail)),
  )

  const exchangeOrders = orders.filter(
    (order) => order.productType === "eProduct" || (order.product && order.product.userEmail),
  )

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-slate-600">Loading your orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 max-w-2xl mx-auto flex flex-col items-center">
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
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Your Purchases</h1>
        <p className="text-slate-500 mt-2">View and manage your completed purchases and exchanges</p>
      </div>

      <Tabs defaultValue="auction" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg h-12 mb-6">
          <TabsTrigger
            value="auction"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Auction Orders ({auctionOrders.length})
          </TabsTrigger>
          <TabsTrigger
            value="exchange"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Exchange Orders ({exchangeOrders.length})
          </TabsTrigger>
        </TabsList>

        {/* Auction Orders Tab */}
        <TabsContent value="auction" className="space-y-6 focus:outline-none">
          {auctionOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
              <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-10 w-10 text-slate-400" />
              </div>
              <CardTitle className="text-xl font-medium text-slate-800 mb-2">No auction orders found</CardTitle>
              <CardDescription className="max-w-md mx-auto text-slate-500">
                When you purchase books through our auction system, they will appear here for easy tracking and
                management.
              </CardDescription>
              <Button className="mt-6" onClick={() => (window.location.href = "/shop/auctions")}>
                Browse Auctions
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
                        className="h-full w-full object-cover transition-transform hover:scale-105"
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
                        <span className="font-medium text-slate-900">₹{order.amount?.toFixed(2)}</span>
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

                  <CardFooter className="border-t border-slate-100 bg-slate-50 p-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const phoneNumber = order.product?.sellerPhone
                        if (phoneNumber) {
                          const message = encodeURIComponent(
                            `Hello, I have a question about my order: ${order.product?.title}`,
                          )
                          const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
                          window.open(whatsappUrl, "_blank")
                        }
                      }}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Seller
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Exchange Orders Tab */}
        <TabsContent value="exchange" className="space-y-6 focus:outline-none">
          {exchangeOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
              <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowLeftRight className="h-10 w-10 text-slate-400" />
              </div>
              <CardTitle className="text-xl font-medium text-slate-800 mb-2">No exchange orders found</CardTitle>
              <CardDescription className="max-w-md mx-auto text-slate-500">
                When you exchange books with other users, your completed exchanges will appear here for tracking.
              </CardDescription>
              <Button className="mt-6" onClick={() => (window.location.href = "/shop/exchanges")}>
                Browse Exchanges
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {exchangeOrders.map((order) => {
                // Extract the received product details from productId
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
                              <p className="text-xs text-slate-500 mt-1">
                                From: {receivedProduct.seller || "Seller information not available"}
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
                              <p className="text-xs text-slate-500 mt-1">
                                Condition: {offeredProduct.eCondition || "Condition not specified"}
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
                            <p className="font-medium text-slate-800">₹{order.amount?.toFixed(2)}</p>
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

                    <CardFooter className="flex flex-wrap gap-3 border-t border-slate-100 bg-white p-5">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => {
                          const phoneNumber = receivedProduct.sellerPhone || offeredProduct.eBuyerPhone
                          if (phoneNumber) {
                            const message = encodeURIComponent(
                              `Regarding our exchange: ${receivedProduct.title || "the book"}`,
                            )
                            window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank")
                          }
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                        {receivedProduct.seller ? "Contact Seller" : "Contact User"}
                      </Button>

                      <Button className="flex items-center gap-2 ml-auto">
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UserOrders
