import { fetchAllUserProducts, fetchProductDetails, setProductDetails } from "@/store/shop/products-slice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ShoppingProductTile from "./product-tile";
import ProductDetailsDialog from "@/pages/shopping-view/product-details";
import SellerExchangeOffers from "./sellerExchangeOffers";
import "@fontsource/inika"; 
import Footer from './footer'


function ShoppingListing() {
    const dispatch = useDispatch();
    const { productList, productDetails, loading } = useSelector((state) => state.shopProductsSlice);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [activeTab, setActiveTab] = useState("products");

    useEffect(() => {
        dispatch(fetchAllUserProducts());
    }, [dispatch]);

    function handleGetProductDetails(getCurrentProductId) {
        dispatch(fetchProductDetails(getCurrentProductId));
    }

    useEffect(() => {
        if (productDetails) {
            setOpenDetailsDialog(true);
        } else {
            setOpenDetailsDialog(false); 
        }
    }, [productDetails]);

        useEffect(() => {
        return () => {
            dispatch(setProductDetails(null)); 
        };
    }, [dispatch]);

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar for Tab Navigation */}
            <div className="w-1/6 shadow-lg p-3 space-y-3 bg-slate-200">
                <div className="flex flex-col space-y-2">
                    <button
                        className={`p-3 rounded-md text-lg font-semibold font-inika ${activeTab === "products" ? "bg-indigo-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                        onClick={() => setActiveTab("products")}
                    >
                        Products Listing
                    </button>
                    <button
                        className={`p-3 rounded-md text-lg font-semibold font-inika ${activeTab === "exchangeOffers" ? "bg-navy text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                        onClick={() => setActiveTab("exchangeOffers")}
                    >
                        Exchange Offers
                    </button>

                </div>
                <div className="mt-4 text-sm text-gray-500">
                    <span>No of Products: {productList.length}</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 ">
                {loading ? (
                    <div className="text-center text-xl text-gray-500">Loading...</div>
                ) : activeTab === "products" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
                            {productList && productList.length > 0 ? (
                                productList
                                    .filter((productItem) => {
                                        const hoursPassed = (Date.now() - new Date(productItem.offerTime)) / (1000 * 60 * 60);
                                        return hoursPassed < 4;
                                    })
                                    .map((productItem) => (
                                        <ShoppingProductTile
                                            key={productItem._id}
                                            handleGetProductDetails={handleGetProductDetails}
                                            product={productItem}
                                        />
                                    ))
                            ) : (
                                <p className="col-span-full text-center text-gray-400">No products available</p>
                            )}
                    </div>
                ) : (
                    <SellerExchangeOffers />
                    
                )}
            </div>

            {/* Product Details Dialog */}
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
