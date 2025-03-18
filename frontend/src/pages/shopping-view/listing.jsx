import { fetchAllUserProducts, fetchProductDetails, setProductDetails } from "@/store/shop/products-slice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ShoppingProductTile from "./product-tile";
import ProductDetailsDialog from "@/pages/shopping-view/product-details";
import SellerExchangeOffers from "./sellerExchangeOffers"; 

function ShoppingListing() {
    const dispatch = useDispatch();
    const {productList, productDetails} = useSelector((state) => state.shopProductsSlice);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [activeTab, setActiveTab] = useState("products"); // Add state for tabs
    
    useEffect(() => {
        dispatch(fetchAllUserProducts());
    }, [dispatch]);

    function handleGetProductDetails(getCurrentProductId) {
        console.log(getCurrentProductId);
        dispatch(fetchProductDetails(getCurrentProductId));
    }

    useEffect(() => {
        if (productDetails !== null) setOpenDetailsDialog(true);
    }, [productDetails]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 p-4 md:p-6">
            <div className="bg-background w-full rounded-lg shadow-sm">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-extrabold">Products</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">No of Products: {productList.length}</span>
                    </div>
                </div>
                
                {/* Add Navigation */}
                <div className="p-4">
                    <div className="flex flex-col space-y-2">
                        <button 
                            className={`p-2 text-left rounded-md ${activeTab === "products" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
                            onClick={() => setActiveTab("products")}
                        >
                            Products Listing
                        </button>
                        <button 
                            className={`p-2 text-left rounded-md ${activeTab === "exchangeOffers" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
                            onClick={() => setActiveTab("exchangeOffers")}
                        >
                            Exchange Offers
                        </button>
                    </div>
                </div>
            </div>
            
            <div>
                {activeTab === "products" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                        {productList && productList.length > 0
                            ? productList.map((productItem) => (
                                <ShoppingProductTile
                                    key={productItem._id}
                                    handleGetProductDetails={handleGetProductDetails}
                                    product={productItem}
                                />
                            ))
                            : <p className="col-span-full text-center py-8 text-muted-foreground">No products available</p>}
                    </div>
                ) : (
                    <SellerExchangeOffers />
                )}
            </div>
            
            <ProductDetailsDialog 
                open={openDetailsDialog} 
                setOpen={setOpenDetailsDialog} 
                productDetails={productDetails}
                setProductDetails={setProductDetails}
            />
        </div>
    );
}

export default ShoppingListing;