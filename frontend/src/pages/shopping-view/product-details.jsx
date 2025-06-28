// import { useState, useEffect } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { Button } from "@/components/ui/button"
// import { Dialog, DialogContent } from "@/components/ui/dialog"
// import { fetchAllProducts } from "@/store/admin/products-slice"
// import { io } from "socket.io-client"
// import { toast } from "react-hot-toast"
// import { exchangeProductFormElements } from "@/config"
// import "@fontsource/nunito-sans"
// import useTimeLeft from "@/hooks/useTimeLeft"
// import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
// import { useNavigate } from "react-router-dom"
// import ProductImageUpload from "@/components/admin-view/image-upload"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { BookOpen, Clock, MessageCircle, RefreshCw, ArrowRight, Loader2, CheckCircle2 } from "lucide-react"
// import api from "@/api/axios"

// let socket = null

// function ProductDetailsDialog({ open, setOpen, productDetails, setProductDetails }) {
//   const API_BASE = import.meta.env.VITE_API_URL || "";
//   const [bidDialogOpen, setBidDialogOpen] = useState(false)
//   const [bidAmount, setBidAmount] = useState("")
//   const [errorMessage, setErrorMessage] = useState("")
//   const dispatch = useDispatch()
//   const [isExchangeSidebarOpen, setIsExchangeSidebarOpen] = useState(false)
//   const [exchangeFormData, setExchangeFormData] = useState({})
//   const timeLeft = useTimeLeft(productDetails?.endTime)
//   const navigate = useNavigate()
//   const [exchangeImageFile, setExchangeImageFile] = useState(null)
//   const [exchangeUploadedImageUrl, setExchangeUploadedImageUrl] = useState("")
//   const [exchangeImageLoadingState, setExchangeImageLoadingState] = useState(false)
//   const [exchangeSubmitted, setExchangeSubmitted] = useState(false)

//   const userEmail = useSelector((state) => state.auth.user?.email)
//   const { user } = useSelector((state) => state.auth)

//   // Check if current user is the seller
//   const isCurrentUserSeller = user?.email === productDetails?.sellerEmail

//   useEffect(() => {
//     if (!socket && open) {
//       socket = io(import.meta.env.VITE_API_URL, {
//         withCredentials: true,
//         transports: ['websocket', 'polling'],
//       });

//       socket.on("newBid", (data) => {
//         if (data.productId === productDetails?._id) {
//           setProductDetails((prevDetails) => ({
//             ...prevDetails,
//             currentBid: data.currentBid,
//           }));
//         }
//         dispatch(fetchAllProducts());
//       });
//     }

//     return () => {
//       if (socket) {
//         socket.off("newBid");
//       }
//     };
//   }, [productDetails?._id, dispatch, setProductDetails, open]);

//   useEffect(() => {
//     if (!isExchangeSidebarOpen) {
//       setExchangeImageLoadingState(false)
//     }
//   }, [isExchangeSidebarOpen])

//   const handleBidChange = (e) => {
//     setBidAmount(e.target.value)
//   }

//   const handleSubmitBid = async () => {
//     const parsedBid = Number.parseFloat(bidAmount)
//     if (isNaN(parsedBid) || parsedBid <= productDetails?.currentBid || parsedBid < productDetails?.minBid) {
//       setErrorMessage("Your bid must be higher than the current bid and meet the minimum bid requirement.")
//       return
//     }

//     try {
//       const response = await api.post(`/shop/products/${productDetails?._id}/placeBid`, {
//         bidAmount: parsedBid,
//         bidderEmail: userEmail,
//       });

//       if (socket) {
//         socket.emit("newBid", {
//           productId: productDetails?._id,
//           currentBid: response.data.currentBid,
//           bidderEmail: response.data.bidderEmail
//         });
//       }

//       setErrorMessage("")
//       setProductDetails((prevDetails) => ({
//         ...prevDetails,
//         currentBid: response.data.currentBid,
//         bidderEmail: response.data.bidderEmail,
//       }))

//       if (socket) {
//         socket.emit("placeBid", {
//           productId: productDetails?._id,
//           currentBid: response.data.currentBid,
//           bidderEmail: response.data.bidderEmail,
//         })
//       }

//       setBidDialogOpen(false)
//       setOpen(false)

//       toast.success("Bid placed successfully!", {
//         duration: 3000,
//         position: "top-right",
//       })

//       dispatch(fetchAllProducts())
//     } catch (error) {
//       console.error("Error placing bid:", error)
//       setErrorMessage(error.response?.data?.message || "Failed to place bid")
//     }
//   }

//   useEffect(() => {
//     if (open) {
//       setBidAmount("")
//       setErrorMessage("")
//     }
//   }, [open])

//   const handleExchangeFormChange = (e) => {
//     setExchangeFormData({ ...exchangeFormData, [e.target.name]: e.target.value })
//   }

//   const handleExchangeSubmit = async () => {
//     const requiredFields = ["eTitle", "eAuthor", "eIsbn", "ePublisher", "ePublicationDate", "eEdition", "eDescription"]

//     const missingFields = requiredFields.filter((field) => !exchangeFormData[field])

//     if (missingFields.length > 0) {
//       toast.error(`Missing required fields: ${missingFields.join(", ")}`)
//       return
//     }
//     if (!exchangeFormData.eTitle || !exchangeFormData.eDescription) {
//       toast.error("Please fill out all required fields.")
//       return
//     }

//     if (!exchangeUploadedImageUrl) {
//       toast.error("Please upload an image of the book you're offering")
//       return
//     }

//     if (!user?.phone) {
//       toast.error("Your phone number is missing. Please update your profile.")
//       return
//     }

//     try {
//       await api.post("/shop/products/offerExchange", {
//         productId: productDetails?._id,
//         userEmail: user?.email,
//         exchangeOffer: {
//           ...exchangeFormData,
//           eImage: exchangeUploadedImageUrl,
//           eBuyerPhone: user.phone,
//         },
//       });

//       setIsExchangeSidebarOpen(false);
//       setExchangeFormData({});
//       setExchangeImageFile(null);
//       setExchangeUploadedImageUrl("");
//       setExchangeSubmitted(true);

//       toast.success("Exchange request sent!");
//     } catch (error) {
//       console.error("Exchange error:", error);
//       toast.error(error.response?.data?.message || "Failed to submit exchange");
//     }
//   }

//   const handleViewMyListings = () => {
//     setOpen(false)
//     navigate("/shop/uploads")
//   }

//   const handleOpenExchangeSidebar = () => {
//     setExchangeImageLoadingState(false)
//     setIsExchangeSidebarOpen(true)
//   }

//   const handleChatWithSeller = () => {
//     const phoneNumber = productDetails?.sellerPhone
//     if (!phoneNumber) {
//       toast.error("Seller's phone number is not available.")
//       return
//     }
//     const message = encodeURIComponent(`Hello, I'm interested in your book: ${productDetails?.title}`)
//     const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
//     window.open(whatsappUrl, "_blank")
//   }

//   const isBiddingEnded = timeLeft === "Bidding Ended"

//   return (
//     <>
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="max-w-6xl p-0 overflow-hidden rounded-xl bg-white">
//           <div className="min-h-screen bg-white">
//             <main className="max-w-7xl mx-auto px-6 py-8">
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
//                 {/* Book Cover */}
//                 <div className="flex justify-center">
//                   <div className="w-full bg-gray-50 rounded-lg overflow-hidden">
//                     {productDetails?.image ? (
//                       <div className="relative h-full min-h-[300px] md:min-h-[450px]">
//                         <img
//                           src={productDetails.image || "/placeholder.svg"}
//                           alt={productDetails?.title}
//                           className="absolute inset-0 w-full h-full object-cover"
//                         />
//                       </div>
//                     ) : (
//                       <div className="flex items-center justify-center h-full min-h-[300px] md:min-h-[450px] bg-gray-100">
//                         <BookOpen className="h-24 w-24 text-gray-300" />
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Book Details */}
//                 <div className="space-y-6">
//                   <div>
//                     <h1 className="text-3xl font-bold text-black mb-2">{productDetails?.title}</h1>
//                     <div className="flex items-center gap-4 mb-4">
//                       <span className="text-black">
//                         <strong>Seller:</strong> {productDetails?.seller}
//                       </span>
//                       <Badge
//                         variant="outline"
//                         className={`${
//                           isBiddingEnded
//                             ? "bg-red-50 text-red-600 border-red-200"
//                             : "bg-green-50 text-green-600 border-green-200"
//                         }`}
//                       >
//                         <Clock className="h-3.5 w-3.5 mr-1" />
//                         {timeLeft}
//                       </Badge>
//                     </div>
//                   </div>

//                   <div className="space-y-3">
//                     <p className="text-black">
//                       <strong>Description:</strong> {productDetails?.description}
//                     </p>

//                     <p className="text-black">
//                       <strong>Author:</strong> {productDetails?.author}
//                     </p>

//                     <p className="text-black">
//                       <strong>ISBN:</strong> {productDetails?.isbn}
//                     </p>

//                     <p className="text-black">
//                       <strong>Publisher:</strong> {productDetails?.publisher}
//                     </p>

//                     <p className="text-black">
//                       <strong>Publication date:</strong> {productDetails?.publicationDate}
//                     </p>

//                     <p className="text-black">
//                       <strong>Edition:</strong> {productDetails?.edition}
//                     </p>
//                   </div>

//                   <div className="space-y-2">
//                     <div className="flex items-center gap-2">
//                       <strong className="text-xl font-semibold text-black">Starting Bid:</strong>
//                       <span className="text-xl font-bold text-teal-700">Rs. {productDetails?.minBid}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <strong className="text-xl font-semibold text-black">Current Bid:</strong>
//                       <span className="text-xl font-bold text-teal-700">Rs. {productDetails?.currentBid}</span>
//                     </div>
//                   </div>

//                   {isCurrentUserSeller ? (
//                     <Button
//                       className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12"
//                       onClick={handleViewMyListings}
//                     >
//                       View My Listings
//                       <ArrowRight className="ml-2 h-4 w-4" />
//                     </Button>
//                   ) : (
//                     <>
//                       <div className="flex items-center gap-2 text-black">
//                         <Button
//                           className={`w-full ${
//                             isBiddingEnded
//                               ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed"
//                               : "bg-green-600 hover:bg-green-700"
//                           } text-white`}
//                           onClick={handleChatWithSeller}
//                           disabled={isBiddingEnded}
//                         >
//                           <MessageCircle className="mr-2 h-4 w-4" />
//                           Chat with Seller
//                         </Button>
//                       </div>

//                       <div className="flex gap-4">
//                         <Button 
//                           className={`flex-1 ${
//                             isBiddingEnded
//                               ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed"
//                               : "bg-teal-600 hover:bg-teal-700"
//                           } text-white`}
//                           size="lg"
//                           onClick={() => setBidDialogOpen(true)}
//                           disabled={isBiddingEnded}
//                         >
//                           Place Bid
//                         </Button>
//                         <Button
//                           variant="outline"
//                           className="flex-1 border-purple-600 bg-purple-50 hover:bg-purple-100 text-purple-600"
//                           size="lg"
//                           onClick={handleOpenExchangeSidebar}
//                           disabled={isBiddingEnded}
//                         >
//                           <RefreshCw className="mr-2 h-4 w-4" />
//                           Exchange
//                         </Button>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </main>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Bid Dialog */}
//       <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
//         <DialogContent className="sm:max-w-md">
//           <div className="space-y-4">
//             <h2 className="text-xl font-bold text-gray-900">Place Your Bid</h2>
//             <p className="text-gray-600">
//               Current bid: <span className="font-semibold text-teal-600">Rs. {productDetails?.currentBid}</span>
//             </p>
//             <p className="text-gray-600">
//               Minimum bid: <span className="font-semibold text-teal-600">Rs. {productDetails?.minBid}</span>
//             </p>

//             <div className="space-y-2">
//               <Label htmlFor="bid-amount">Your Bid Amount (Rs.)</Label>
//               <Input
//                 id="bid-amount"
//                 type="number"
//                 value={bidAmount}
//                 onChange={handleBidChange}
//                 placeholder="Enter your bid amount..."
//                 className="w-full"
//                 min={productDetails?.minBid}
//                 step="0.01"
//               />
//             </div>

//             {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

//             <div className="flex justify-end space-x-2 pt-4">
//               <Button variant="outline" onClick={() => setBidDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSubmitBid}>
//                 Submit Bid
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Exchange Offer Sheet */}
//       <Sheet
//         open={isExchangeSidebarOpen}
//         onOpenChange={(open) => {
//           if (!open) {
//             setExchangeImageLoadingState(false)
//           }
//           setIsExchangeSidebarOpen(open)
//         }}
//       >
//         <SheetContent className="sm:max-w-md overflow-y-auto">
//           <SheetHeader className="mb-6">
//             <SheetTitle className="text-xl font-bold text-gray-900">Offer an Exchange</SheetTitle>
//           </SheetHeader>

//           <div className="space-y-6">
//             <div className="space-y-2">
//               <Label className="text-base">Book Image</Label>
//               <ProductImageUpload
//                 imageFile={exchangeImageFile}
//                 setImageFile={setExchangeImageFile}
//                 uploadedImageUrl={exchangeUploadedImageUrl}
//                 setUploadedImageUrl={setExchangeUploadedImageUrl}
//                 setImageLoadingState={setExchangeImageLoadingState}
//                 imageLoadingState={exchangeImageLoadingState}
//                 isCustomStyling={true}
//               />
//             </div>

//             {exchangeProductFormElements.map((field) => (
//               <div key={field.name} className="space-y-2">
//                 <Label htmlFor={field.name} className="text-base">
//                   {field.label}
//                 </Label>
//                 <Input
//                   id={field.name}
//                   type={field.type}
//                   name={field.name}
//                   placeholder={field.placeholder}
//                   onChange={handleExchangeFormChange}
//                   value={exchangeFormData[field.name] || ""}
//                 />
//               </div>
//             ))}

//             <Button
//               className="w-full bg-purple-600 hover:bg-teal-700 text-white h-12 mt-6"
//               onClick={handleExchangeSubmit}
//               disabled={exchangeImageLoadingState || !exchangeUploadedImageUrl}
//             >
//               {exchangeImageLoadingState ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Uploading Image...
//                 </>
//               ) : (
//                 "Submit Exchange Offer"
//               )}
//             </Button>
//           </div>
//         </SheetContent>
//       </Sheet>

//       <Dialog open={exchangeSubmitted} onOpenChange={setExchangeSubmitted}>
//         <DialogContent className="sm:max-w-md">
//           <div className="flex flex-col items-center text-center p-6">
//             <div className="bg-green-100 p-3 rounded-full mb-4">
//               <CheckCircle2 className="h-8 w-8 text-green-600" />
//             </div>
//             <h3 className="text-xl font-bold text-gray-900 mb-2">Offer Sent Successfully!</h3>
//             <p className="text-gray-600 mb-6">
//               Your exchange offer has been sent to the seller. They'll contact you if they're interested.
//             </p>
//             <Button
//               className="w-full bg-teal-600 hover:bg-teal-700"
//               onClick={() => setExchangeSubmitted(false)}
//             >
//               OK
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }

// export default ProductDetailsDialog