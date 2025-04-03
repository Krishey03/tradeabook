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
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet" // Import Sheet components
import { ChatIcon } from '@heroicons/react/outline'; 

let socket = null

function ProductDetailsDialog({ open, setOpen, productDetails, setProductDetails }) {
    const [isCardOpen, setIsCardOpen] = useState(false)
    const [bidAmount, setBidAmount] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const dispatch = useDispatch()
    const [isExchangeSidebarOpen, setIsExchangeSidebarOpen] = useState(false) // For the sidebar
    const [exchangeFormData, setExchangeFormData] = useState({})
    const timeLeft = useTimeLeft(productDetails?.endTime)
    console.log("Time left:", timeLeft);

    const userEmail = useSelector((state) => state.auth.user?.email)

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

    // Exchange Form
    const handleExchangeFormChange = (e) => {
        setExchangeFormData({ ...exchangeFormData, [e.target.name]: e.target.value });
    };

    const handleExchangeSubmit = async () => {
        if (!exchangeFormData.eTitle || !exchangeFormData.eDescription) {
            toast.error("Please fill out all required fields.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/shop/products/offerExchange", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: productDetails?._id,
                    userEmail,
                    exchangeOffer: exchangeFormData,
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

                    <div className="grid gap-6 font-nunito ">
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

                        <div className="flex space-x-4">
                        <Button
                            className="text-white font-nunito h-[50px] w-[150px]"
                            onClick={() => setIsCardOpen(!isCardOpen)}
                            disabled={timeLeft === "Bidding Ended"}
                        >
                            {isCardOpen ? "Close Bid Form" : "Place a Bid"}
                        </Button>

                            <Button className='text-white font-nunito h-[50px] w-[150px]' 
                                onClick={() => setIsExchangeSidebarOpen(true)}
                                disabled={timeLeft === "Bidding Ended"}
                            >
                                Offer an exchange
                            </Button>


                            {/* WhatsApp Message Icon */}
                            <Button
                                className="text-white font-nunito items-center h-[50px] w-[150px] items-center justify-center"
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
                                disabled={timeLeft === "Bidding Ended"}
                            >
                                <ChatIcon  /> {/* Chat Icon */}
                                Chat on WhatsApp
                            </Button>
                        </div>

                        {isCardOpen && (
                            <Card className="w-96 p-4 mt-4">
                                <CardContent className="space-y-4">
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
                                    <Button className="text-white" onClick={handleSubmitBid}>
                                        Submit Bid
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Exchange Sidebar */}
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
                        <Button className="mt-4 w-full" onClick={handleExchangeSubmit}>
                            Submit Exchange Offer
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}

export default ProductDetailsDialog
