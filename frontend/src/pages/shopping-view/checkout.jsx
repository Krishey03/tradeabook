import React, { useEffect, useState } from "react";
import axios from "axios";


const Checkout = ({ userEmail }) => {
    const [wonItems, setWonItems] = useState([]);

    useEffect(() => {
        if (!userEmail) return; 

        axios.get(`/api/cart/${userEmail}`)
            .then(res => setWonItems(res.data.data))
            .catch(err => console.error(err));
    }, [userEmail]);

    return (
        <div>
            <h2>Checkout</h2>
            {wonItems.length === 0 ? (
                <p>You have no items to checkout.</p>
            ) : (
                <div className="checkout-container">
                    {wonItems.map(item => (
                        <div key={item._id} className="checkout-item">
                            <img src={item.image} alt={item.title} className="checkout-image" />
                            <div className="checkout-details">
                                <h3>{item.title}</h3>
                                <p>Final Bid: ${item.currentBid}</p>
                                <button className="pay-btn">Pay Now</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Checkout;
