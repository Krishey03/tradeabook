import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function Checkout() {
  const [activeTab, setActiveTab] = useState("bid"); // Default to bid checkout
  const [exchangeOffer, setExchangeOffer] = useState(null);
  const [bidDetails, setBidDetails] = useState(null);
  const [cartItems, setCartItems] = useState([]); 

  // Get logged-in user's email from Redux store
  const { user } = useSelector((state) => state.auth);
  const email = user?.email; 

  useEffect(() => {
    const storedExchangeOffer = localStorage.getItem("acceptedExchangeOffer");
    const storedBidDetails = localStorage.getItem("acceptedBid");

    if (storedExchangeOffer) {
      setExchangeOffer(JSON.parse(storedExchangeOffer));
    }
    if (storedBidDetails) {
      setBidDetails(JSON.parse(storedBidDetails));
    }

    if (email) {
      fetch(`http://localhost:5000/api/shop/products/cart/${email}`)
        .then(response => response.json())
        .then(data => {
          console.log("Cart Items:", data);
          setCartItems(data.data || []);
        })
        .catch(error => console.error("Error fetching cart items:", error));
    }
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
                      <Button className="mt-4 w-full text-white">Proceed to Payment</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No bid items in your cart.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exchange Checkout */}
        <TabsContent value="exchange">
          <Card className="mt-4">
            <CardHeader>
              <h3 className="text-lg font-bold">Exchange Checkout</h3>
            </CardHeader>
            <CardContent>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Checkout;
