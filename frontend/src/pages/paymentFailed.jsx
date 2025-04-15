import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function PaymentFailed() {
  const location = useLocation();
  const [errorReason, setErrorReason] = useState("Unknown error");
  const [errorMessage, setErrorMessage] = useState("");
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reason = params.get("reason") || "unknown";
    const message = params.get("message") || "";
    
    // Map reason codes to user-friendly messages
    const reasonMap = {
      "record_not_found": "Payment record could not be found in our system.",
      "verification_error": "There was an error verifying your payment with Khalti.",
      "missing_pidx": "Payment identifier was missing in the callback.",
      "payment_not_completed": "The payment was not marked as completed by Khalti.",
      "unknown": "An unknown error occurred during payment processing."
    };
    
    setErrorReason(reasonMap[reason] || reasonMap["unknown"]);
    setErrorMessage(message);
  }, [location.search]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-red-50 border-b">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-red-700">Payment Failed</h2>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-gray-700">{errorReason}</p>
            
            {errorMessage && (
              <p className="text-sm text-gray-500">Technical details: {errorMessage}</p>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">Please try again or contact support if the problem persists.</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center space-x-4 pt-2">
          <Link to="/checkout">
            <Button variant="outline">Back to Checkout</Button>
          </Link>
          <Link to="/">
            <Button>Go to Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default PaymentFailed;