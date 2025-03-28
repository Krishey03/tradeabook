import { useEffect } from "react";

const Checkout = () => {
    useEffect(() => {
        fetch("http://localhost:5000/api/shop/products/cart/test@example.com")
            .then(response => response.json())
            .then(data => {
                console.log("Cart Items:", data); // This prints in the browser console
            })
            .catch(error => console.error("Error fetching cart items:", error));
    }, []);

    return (
        <div>
            <h1>Checkout</h1>
            <p>Check the browser console for cart items.</p>
        </div>
    );
};

export default Checkout;
