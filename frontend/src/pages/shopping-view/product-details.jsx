import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { fetchAllProducts } from "@/store/admin/products-slice"
import { io } from "socket.io-client"
import { toast } from "react-hot-toast"
import { exchangeProductFormElements } from "@/config"
import "@fontsource/nunito-sans"
import useTimeLeft from "@/hooks/useTimeLeft"
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet"
import { ChatIcon } from '@heroicons/react/outline'
import { useNavigate } from "react-router-dom"

let socket = null

function ProductDetailsDialog({ open, setOpen, productDetails, setProductDetails }) {
    const [isCardOpen, setIsCardOpen] = useState(false)
    const [bidAmount, setBidAmount] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const dispatch = useDispatch()
    const [isExchangeSidebarOpen, setIsExchangeSidebarOpen] = useState(false)
    const [exchangeFormData, setExchangeFormData] = useState({})
    const timeLeft = useTimeLeft(productDetails?.endTime)
    const navigate = useNavigate()

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

    const handleBidChange = (e) => {
        setBidAmount(e.target.value)
    }

    const handleSubmitBid = async () => {
        const parsedBid = parseFloat(bidAmount);
        if (isNaN(parsedBid) || parsedBid <= productDetails?.currentBid || parsedBid < productDetails?.minBid) {
            setErrorMessage("Your bid must be higher than the current bid and meet the minimum bid requirement.");
            return;
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

            setIsCardOpen(false)
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
        setExchangeFormData({ ...exchangeFormData, [e.target.name]: e.target.value });
    };

    const handleExchangeSubmit = async () => {
        if (!exchangeFormData.eTitle || !exchangeFormData.eDescription) {
            toast.error("Please fill out all required fields.");
            return;
        }
    
        if (!user?.phone) {
            toast.error("Your phone number is missing. Please update your profile.");
            return;
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
                        eBuyerPhone: user.phone,
                    },
                }),
            });
    
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Failed to submit exchange. Server response: ${text}`);
            }
    
            const data = await response.json();
            setIsExchangeSidebarOpen(false);
            toast.success("Exchange request sent!");
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleViewMyListings = () => {
        setOpen(false);
        navigate("/shop/uploads");
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="grid grid-cols-2 gap-8 sm:p-12 max-w-[110vw] sm:max-w-[100vw] lg:max-w-[90vw] scale-[0.8]">
                    <div className="relative overflow-hidden rounded-lg">
                        <img
                            src={productDetails?.image}
                            alt={productDetails?.title}
                            width={600}
                            height={600}
                            className="aspect-square w-full object-cover"
                        />
                    </div>

                    <div className="grid gap-6 font-nunito">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-extrabold">{productDetails?.title}</h1>
                            <span className="text-xl font-sans text-primary">Time Left: {timeLeft}</span>
                        </div>
                        <p className="text-lg font-bold text-muted-foreground">Author: {productDetails?.author}</p>
                        <p className="text-lg font-semibold text-muted-foreground">ISBN: {productDetails?.isbn}</p>
                        <p className="text-lg font-semibold text-muted-foreground">Publisher: {productDetails?.publisher}</p>
                        <p className="text-lg font-semibold text-muted-foreground">Publication Date: {productDetails?.publicationDate}</p>
                        <p className="text-lg font-semibold text-muted-foreground">Edition: {productDetails?.edition}</p>
                        <p className="text-lg font-normal text-muted-foreground">Description: {productDetails?.description}</p>
                        <p className="text-lg font-bold text-muted-foreground">Seller: {productDetails?.seller}</p>
                        <p className="text-3xl font-extrabold text-primary">Minimum Bid: Rs. {productDetails?.minBid}</p>
                        <p className="text-2xl font-extrabold text-primary">Current Bid: Rs. {productDetails?.currentBid}</p>
                        
                        {isCurrentUserSeller ? (
                            <div className="flex flex-wrap gap-4">
                                <button
                                    className="px-6 py-3 rounded-lg font-nunito font-semibold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 h-[50px] w-[180px]"
                                    onClick={handleViewMyListings}
                                >
                                    View My Listings
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-4">
                                <button
                                    className={`px-6 py-3 rounded-lg font-nunito font-semibold text-white transition-all duration-300 
                                    ${timeLeft === "Bidding Ended" 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform'}
                                    flex items-center justify-center gap-2 h-[50px] w-[180px]`}
                                    onClick={() => setIsCardOpen(!isCardOpen)}
                                    disabled={timeLeft === "Bidding Ended"}
                                >
                                    Place a bid
                                    {timeLeft !== "Bidding Ended" && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                    )}
                                </button>

                                <button
                                    className={`px-6 py-3 rounded-lg font-nunito font-semibold text-white transition-all duration-300 
                                    ${timeLeft === "Bidding Ended" 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg'}
                                    flex items-center justify-center gap-2 h-[50px] w-[180px]`}
                                    onClick={() => setIsExchangeSidebarOpen(true)}
                                    disabled={timeLeft === "Bidding Ended"}
                                >
                                    Send offer
                                    {timeLeft !== "Bidding Ended" && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                    )}
                                </button>

                                <button
                                    className={`px-6 py-3 rounded-lg font-nunito font-semibold text-white transition-all duration-300 
                                    ${timeLeft === "Bidding Ended" 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform'}
                                    flex items-center justify-center h-[50px] w-[150px]`}
                                    onClick={() => {
                                    const phoneNumber = productDetails?.sellerPhone;
                                    if (!phoneNumber) {
                                        toast.error("Seller's phone number is not available.");
                                        return;
                                    }
                                    const message = encodeURIComponent(`Hello, I'm interested in your book: ${productDetails?.title}`);
                                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
                                    window.open(whatsappUrl, "_blank");
                                    }}
                                    disabled={timeLeft === "Bidding Ended"}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Chat
                                </button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isCardOpen} onOpenChange={setIsCardOpen}>
                <DialogContent className="max-w-md">
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Place Your Bid</h2>
                        <input
                            type="number"
                            value={bidAmount}
                            onChange={handleBidChange}
                            placeholder="Enter your bid amount..."
                            className="w-full p-2 border rounded-md bg-white"
                            min={productDetails?.minBid}
                            step="0.01"
                        />
                        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsCardOpen(false)}>
                                Cancel
                            </Button>
                            <Button className="text-white" onClick={handleSubmitBid}>
                                Submit Bid
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Sheet open={isExchangeSidebarOpen} onOpenChange={() => setIsExchangeSidebarOpen(false)}>
                <SheetContent side="right" className="overflow-auto bg-slate-200 dark:ring-offset-white p-6 rounded-lg shadow-xl transition-all duration-300">
                    <SheetHeader className="text-xl font-semibold text-gray-900 dark:text-black">
                        Offer an Exchange
                    </SheetHeader>
                    <div className="border-b border-gray-300 dark:border-gray-700 my-4"></div>

                    <div className="flex flex-col gap-4">
                        {exchangeProductFormElements.map((field) => (
                            <div key={field.name} className="mb-4">
                                <label className="block font-medium">{field.label}</label>
                                <input
                                    type={field.type}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    onChange={handleExchangeFormChange}
                                    className="w-full p-2 border rounded-md bg-white"
                                />
                            </div>
                        ))}
                        <Button className="text-white mt-4 w-full" onClick={handleExchangeSubmit}>
                            Submit Exchange Offer
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}

export default ProductDetailsDialog