"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { fetchAllProducts } from "@/store/admin/products-slice"
import { io } from "socket.io-client"
import { toast } from "react-hot-toast"
import { exchangeProductFormElements } from "@/config"
import "@fontsource/nunito-sans"
import useTimeLeft from "@/hooks/useTimeLeft"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useNavigate } from "react-router-dom"
import ProductImageUpload from "@/components/admin-view/image-upload"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Clock, MessageCircle, RefreshCw, ArrowRight, Loader2 } from "lucide-react"

let socket = null

function ProductDetailsDialog({ open, setOpen, productDetails, setProductDetails }) {
  const [bidDialogOpen, setBidDialogOpen] = useState(false)
  const [bidAmount, setBidAmount] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const dispatch = useDispatch()
  const [isExchangeSidebarOpen, setIsExchangeSidebarOpen] = useState(false)
  const [exchangeFormData, setExchangeFormData] = useState({})
  const timeLeft = useTimeLeft(productDetails?.endTime)
  const navigate = useNavigate()
  const [exchangeImageFile, setExchangeImageFile] = useState(null)
  const [exchangeUploadedImageUrl, setExchangeUploadedImageUrl] = useState("")
  const [exchangeImageLoadingState, setExchangeImageLoadingState] = useState(false)

  const userEmail = useSelector((state) => state.auth.user?.email)
  const { user } = useSelector((state) => state.auth)

  // Check if current user is the seller
  const isCurrentUserSeller = user?.email === productDetails?.sellerEmail

  useEffect(() => {
    if (!socket) {
      socket = io("http://localhost:5000")

      socket.on("newBid", (data) => {
        if (data.productId === productDetails?._id) {
          setProductDetails((prevDetails) => ({
            ...prevDetails,
            currentBid: data.currentBid,
          }))
        }
        dispatch(fetchAllProducts())
      })
    }

    return () => {
      if (socket) {
        socket.off("newBid")
      }
    }
  }, [productDetails?._id, dispatch, setProductDetails])


  useEffect(() => {
    if (!isExchangeSidebarOpen) {
      setExchangeImageLoadingState(false)
    }
  }, [isExchangeSidebarOpen])

  const handleBidChange = (e) => {
    setBidAmount(e.target.value)
  }

  const handleSubmitBid = async () => {
    const parsedBid = Number.parseFloat(bidAmount)
    if (isNaN(parsedBid) || parsedBid <= productDetails?.currentBid || parsedBid < productDetails?.minBid) {
      setErrorMessage("Your bid must be higher than the current bid and meet the minimum bid requirement.")
      return
    }

    try {
      const response = await fetch("http://localhost:5000/api/shop/products/placeBid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productDetails?._id,
          bidAmount: parsedBid,
          bidderEmail: userEmail,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to place bid.")

      setErrorMessage("")
      setProductDetails((prevDetails) => ({
        ...prevDetails,
        currentBid: data.currentBid,
        bidderEmail: data.bidderEmail,
      }))

      if (socket) {
        socket.emit("placeBid", {
          productId: productDetails?._id,
          currentBid: data.currentBid,
          bidderEmail: data.bidderEmail,
        })
      }

      setBidDialogOpen(false)
      setOpen(false)

      toast.success("Bid placed successfully!", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#4CAF50",
          color: "#fff",
          fontWeight: "bold",
          borderRadius: "8px",
        },
      })

      dispatch(fetchAllProducts())
    } catch (error) {
      console.error("Error placing bid:", error)
      setErrorMessage(error.message)
    }
  }

  useEffect(() => {
    if (open) {
      setBidAmount("")
      setErrorMessage("")
    }
  }, [open])

  const handleExchangeFormChange = (e) => {
    setExchangeFormData({ ...exchangeFormData, [e.target.name]: e.target.value })
  }

  const handleExchangeSubmit = async () => {
    const requiredFields = ["eTitle", "eAuthor", "eIsbn", "ePublisher", "ePublicationDate", "eEdition", "eDescription"]

    const missingFields = requiredFields.filter((field) => !exchangeFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(", ")}`)
      return
    }
    if (!exchangeFormData.eTitle || !exchangeFormData.eDescription) {
      toast.error("Please fill out all required fields.")
      return
    }

    if (!exchangeUploadedImageUrl) {
      toast.error("Please upload an image of the book you're offering")
      return
    }

    if (!user?.phone) {
      toast.error("Your phone number is missing. Please update your profile.")
      return
    }

    try {
      const response = await fetch("http://localhost:5000/api/shop/products/offerExchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productDetails?._id,
          userEmail: user?.email,
          exchangeOffer: {
            ...exchangeFormData,
            eImage: exchangeUploadedImageUrl,
            eBuyerPhone: user.phone,
          },
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Failed to submit exchange. Server response: ${text}`)
      }

      const data = await response.json()
      setIsExchangeSidebarOpen(false)
      toast.success("Exchange request sent!")

      // Reset form data and image states after successful submission
      setExchangeFormData({})
      setExchangeImageFile(null)
      setExchangeUploadedImageUrl("")
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleViewMyListings = () => {
    setOpen(false)
    navigate("/shop/uploads")
  }

  const handleOpenExchangeSidebar = () => {
    setExchangeImageLoadingState(false)
    setIsExchangeSidebarOpen(true)
  }

  const handleChatWithSeller = () => {
    const phoneNumber = productDetails?.sellerPhone
    if (!phoneNumber) {
      toast.error("Seller's phone number is not available.")
      return
    }
    const message = encodeURIComponent(`Hello, I'm interested in your book: ${productDetails?.title}`)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  const isBiddingEnded = timeLeft === "Bidding Ended"

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-xl">
          <div className="flex flex-col md:flex-row">
            {/* Product Image */}
            <div className="w-full md:w-2/5 bg-gray-50">
              {productDetails?.image ? (
                <div className="relative h-full min-h-[300px] md:min-h-[450px]">
                  <img
                    src={productDetails.image || "/placeholder.svg"}
                    alt={productDetails?.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[300px] md:min-h-[450px] bg-gray-100">
                  <BookOpen className="h-24 w-24 text-gray-300" />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto max-h-[80vh]">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <Badge
                      variant="outline"
                      className={`${
                        isBiddingEnded
                          ? "bg-red-50 text-red-600 border-red-200"
                          : "bg-green-50 text-green-600 border-green-200"
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {timeLeft}
                    </Badge>
                  </div>

                  {/* Title and author */}
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-nunito mb-2">
                    {productDetails?.title}
                  </h1>
                  <p className="text-lg font-medium text-gray-700 mb-4">by {productDetails?.author}</p>

                  {/* Book details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">ISBN</p>
                      <p className="text-base text-gray-900">{productDetails?.isbn}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Publisher</p>
                      <p className="text-base text-gray-900">{productDetails?.publisher}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Publication Date</p>
                      <p className="text-base text-gray-900">{productDetails?.publicationDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Edition</p>
                      <p className="text-base text-gray-900">{productDetails?.edition}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                    <p className="text-base text-gray-700">{productDetails?.description}</p>
                  </div>

                  <Separator className="my-6" />

                  {/* Seller info */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-500">Seller</p>
                    <p className="text-base font-medium text-gray-900">{productDetails?.seller}</p>
                  </div>

                  {/* Bid info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-teal-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-teal-600 mb-1">Minimum Bid</p>
                      <p className="text-xl font-bold text-teal-700">Rs. {productDetails?.minBid}</p>
                    </div>
                    <div className="bg-teal-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-teal-600 mb-1">Current Bid</p>
                      <p className="text-xl font-bold text-teal-700">Rs. {productDetails?.currentBid}</p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                {isCurrentUserSeller ? (
                  <Button
                    className="w-full bg-black:400 hover:bg-teal-700 text-white h-12 mt-4"
                    onClick={handleViewMyListings}
                  >
                    View My Listings
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                    <Button
                      className={`w-full ${
                        isBiddingEnded
                          ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed"
                          : "bg-black:400 hover:bg-teal-700"
                      } text-white`}
                      onClick={() => setBidDialogOpen(true)}
                      disabled={isBiddingEnded}
                    >
                      Place a Bid
                    </Button>
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={handleOpenExchangeSidebar}
                      disabled={isBiddingEnded}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Send Offer
                    </Button>
                    <Button
                      className={`w-full ${
                        isBiddingEnded
                          ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      } text-white`}
                      onClick={handleChatWithSeller}
                      disabled={isBiddingEnded}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bid Dialog */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Place Your Bid</h2>
            <p className="text-gray-600">
              Current bid: <span className="font-semibold text-teal-600">Rs. {productDetails?.currentBid}</span>
            </p>
            <p className="text-gray-600">
              Minimum bid: <span className="font-semibold text-teal-600">Rs. {productDetails?.minBid}</span>
            </p>

            <div className="space-y-2">
              <Label htmlFor="bid-amount">Your Bid Amount (Rs.)</Label>
              <Input
                id="bid-amount"
                type="number"
                value={bidAmount}
                onChange={handleBidChange}
                placeholder="Enter your bid amount..."
                className="w-full"
                min={productDetails?.minBid}
                step="0.01"
              />
            </div>

            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setBidDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-black hover:bg-teal-700 text-white" onClick={handleSubmitBid}>
                Submit Bid
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exchange Offer Sheet */}
      <Sheet
        open={isExchangeSidebarOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Reset loading state when closing the sheet to prevent auto-upload
            setExchangeImageLoadingState(false)
          }
          setIsExchangeSidebarOpen(open)
        }}
      >
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold text-gray-900">Offer an Exchange</SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base">Book Image</Label>
              <ProductImageUpload
                imageFile={exchangeImageFile}
                setImageFile={setExchangeImageFile}
                uploadedImageUrl={exchangeUploadedImageUrl}
                setUploadedImageUrl={setExchangeUploadedImageUrl}
                setImageLoadingState={setExchangeImageLoadingState}
                imageLoadingState={exchangeImageLoadingState}
                isCustomStyling={true}
              />
            </div>

            {exchangeProductFormElements.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-base">
                  {field.label}
                </Label>
                <Input
                  id={field.name}
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  onChange={handleExchangeFormChange}
                  value={exchangeFormData[field.name] || ""}
                />
              </div>
            ))}

            <Button
              className="w-full bg-purple-600 hover:bg-teal-700 text-white h-12 mt-6"
              onClick={handleExchangeSubmit}
              disabled={exchangeImageLoadingState || !exchangeUploadedImageUrl}
            >
              {exchangeImageLoadingState ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading Image...
                </>
              ) : (
                "Submit Exchange Offer"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default ProductDetailsDialog
