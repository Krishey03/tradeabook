import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { fetchAllProducts } from "@/store/admin/products-slice"
import { io } from "socket.io-client"
import { toast } from "react-hot-toast"

let socket = null

function ProductDetailsDialog({ open, setOpen, productDetails, setProductDetails }) {
    const [isCardOpen, setIsCardOpen] = useState(false)
    const [bidAmount, setBidAmount] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const dispatch = useDispatch()

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
        const parsedBid = parseFloat(bidAmount)
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

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="grid grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw]">
                    <div className="relative overflow-hidden rounded-lg">
                        <img
                            src={productDetails?.image}
                            alt={productDetails?.title}
                            width={600}
                            height={600}
                            className="aspect-square w-full object-cover"
                        />
                    </div>

                    <div className="grid gap-6">
                        <h1 className="text-3xl font-extrabold">Title: {productDetails?.title}</h1>
                        <p className="text-muted-foreground">Author: {productDetails?.author}</p>
                        <p className="text-muted-foreground">ISBN: {productDetails?.isbn}</p>
                        <p className="text-muted-foreground">Publisher: {productDetails?.publisher}</p>
                        <p className="text-muted-foreground">Publication Date: {productDetails?.publicationDate}</p>
                        <p className="text-muted-foreground">Edition: {productDetails?.edition}</p>
                        <p className="text-muted-foreground">Description: {productDetails?.description}</p>
                        <p className="text-muted-foreground">Seller: {productDetails?.seller}</p>
                        <p className="text-3xl font-bold text-primary">Minimum Bid: Rs. {productDetails?.minBid}</p>
                        <p className="text-2xl font-bold text-primary">Current Bid: Rs. {productDetails?.currentBid}</p>

                        <Button className='text-white' onClick={() => setIsCardOpen(!isCardOpen)}>
                            {isCardOpen ? "Close Bid Form" : "Place a Bid"}
                        </Button>

                        <Button className='text-white'>Offer an exchange</Button>

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
        </>
    )
}

export default ProductDetailsDialog
