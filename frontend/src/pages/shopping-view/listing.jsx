import {
    fetchAllUserProducts,
    fetchProductDetails,
    setProductDetails,
} from "@/store/shop/products-slice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ShoppingProductTile from "./product-tile";
import ProductDetailsDialog from "@/pages/shopping-view/product-details";
import SellerExchangeOffers from "./sellerExchangeOffers";
import "@fontsource/inika";
import Footer from "./footer";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function ShoppingListing() {
    const dispatch = useDispatch();
    const { productList, productDetails, loading } = useSelector(
        (state) => state.shopProductsSlice
    );
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [activeTab, setActiveTab] = useState("products");
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchAllUserProducts());
    }, [dispatch]);

    useEffect(() => {
        socket.on("productUpdated", ({ productId }) => {
            dispatch(fetchAllUserProducts());
        });

        socket.on("newBid", ({ productId }) => {
            dispatch(fetchAllUserProducts());
        });

        socket.on("newProductAdded", (newProduct) => {
            dispatch(fetchAllUserProducts());
        });

        return () => {
            socket.off("productUpdated");
            socket.off("newBid");
            socket.off("newProductAdded");
        };
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
        <>
            {/* Overlay when mobile sidebar is open */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-40 z-30 md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            <div className="relative min-h-screen bg-gray-100">
                {/* Sidebar - absolutely positioned, with a fixed width */}
                <div
                    className={`fixed top-16 left-0 z-40 w-64 h-screen bg-slate-200 shadow-md transition-transform duration-200 ease-in-out ${
                        mobileSidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full md:translate-x-0"
                    }`}
                >
                    <div className="p-4 mt-4 space-y-4 font-inika">
                        <button
                            className={`w-full px-4 py-2 rounded-md text-left font-semibold ${
                                activeTab === "products"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 hover:bg-gray-200"
                            }`}
                            onClick={() => {
                                setActiveTab("products");
                                setMobileSidebarOpen(false);
                            }}
                        >
                            Products Listing
                        </button>
                        <button
                            className={`w-full px-4 py-2 rounded-md text-left font-semibold ${
                                activeTab === "exchangeOffers"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 hover:bg-gray-200"
                            }`}
                            onClick={() => {
                                setActiveTab("exchangeOffers");
                                setMobileSidebarOpen(false);
                            }}
                        >
                            Exchange Offers
                        </button>
                    </div>
                </div>

                {/* Hamburger - only visible on mobile */}
                <button
                    className="md:hidden fixed bottom-4 left-4 z-50 bg-white p-3 rounded-full shadow-lg border border-gray-300"
                    onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>

                {/* Main Content - full width */}
                <div className={`p-4 pt-6 transition-all duration-300 ${mobileSidebarOpen ? "pl-72" : "pl-0"} md:pl-72`}>

                    {loading ? (
                        <div className="text-center text-xl text-gray-500">
                            Loading...
                        </div>
                    ) : activeTab === "products" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {productList && productList.length > 0 ? (
                                productList
                                    .filter((productItem) => {
                                        const daysPassed =
                                            (Date.now() -
                                                new Date(
                                                    productItem.offerTime
                                                )) /
                                            (1000 * 60 * 60 * 24);
                                        return daysPassed < 4;
                                    })
                                    .map((productItem) => (
                                        <ShoppingProductTile
                                            key={productItem._id}
                                            handleGetProductDetails={
                                                handleGetProductDetails
                                            }
                                            product={productItem}
                                        />
                                    ))
                            ) : (
                                <p className="col-span-full text-center text-gray-400">
                                    No products available
                                </p>
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
        </>
    );
}

export default ShoppingListing;
