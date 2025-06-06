import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";

function PaymentSuccess() {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const pidx = params.get("purchase_order_id") || params.get("pidx");
        
        if (!pidx) {
          setError("Transaction ID not found");
          setLoading(false);
          return;
        }
        
        console.log("Fetching payment details for transaction ID:", pidx);
        
        const response = await api.get(`/api/payment/${pidx}`);
        
        if (response.data.success) {
          setPaymentDetails(response.data.payment);
        } else {
          setError("Could not retrieve payment details");
        }
      } catch (err) {
        console.error("Error fetching payment details:", err);
        setError("An error occurred while fetching payment details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentDetails();
  }, [location.search]);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  

  const formatAmount = (amount) => {
    return amount.toFixed(2);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
          <p className="text-gray-500">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h2 className="text-xl font-bold text-red-600">Payment Error</h2>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Link to="/checkout">
              <Button>Return to Checkout</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-green-50 border-b">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-green-700">Payment Successful!</h2>
        </CardHeader>
        
        <CardContent className="pt-6">
          {paymentDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <p className="text-gray-600">Transaction ID:</p>
                <p className="font-medium">{paymentDetails._id}</p>
                
                <p className="text-gray-600">Amount:</p>
                <p className="font-medium">Rs. {formatAmount(paymentDetails.amount)}</p>
                
                <p className="text-gray-600">Status:</p>
                <p className="font-medium text-green-600 uppercase">{paymentDetails.status}</p>
                
                <p className="text-gray-600">Payment Method:</p>
                <p className="font-medium capitalize">{paymentDetails.paymentMethod}</p>
                
                <p className="text-gray-600">Date:</p>
                <p className="font-medium">{formatDate(paymentDetails.createdAt)}</p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center space-x-4 pt-2">

          <Link to="/shop/home">
            <Button className='text-white'>Go to Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default PaymentSuccess;