import {
    fetchAllUserProducts,
} from "@/store/shop/products-slice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ShoppingProductTile from "./product-tile";
import SellerExchangeOffers from "./sellerExchangeOffers";
import "@fontsource/inika";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

function ShoppingListing() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { productList, loading } = useSelector(
        (state) => state.shopProductsSlice
    );
    const [activeTab, setActiveTab] = useState("products");
    const [searchQuery, setSearchQuery] = useState("");

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

    const filteredProducts = productList?.filter((productItem) => {
        const daysPassed = (Date.now() - new Date(productItem.offerTime)) / (1000 * 60 * 60 * 24);
        const matchesSearch = productItem.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             productItem.description.toLowerCase().includes(searchQuery.toLowerCase());
        return daysPassed < 4 && (searchQuery === "" || matchesSearch);
    });

    return (
        <div className="min-h-screen">
            {/* Fixed Header - Adjusted height */}
            <div className="fixed  left-0 right-0 z-40 bg-white shadow-sm h-[72px] md:h-[64px] border-t">
                <div className="container mx-auto px-4 pt-[10px] md:pt-[10px] pb-6">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center justify-between h-full">
                    {/* Heading alone */}
                    <h2 className="text-center text-2xl font-semibold mb-6 sm:mb-0">
                        Library
                    </h2>

                    {/* Group tabs + search together */}
                    <div className="flex items-center gap-4">
                        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                        <button
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === "products"
                                ? "bg-white shadow text-indigo-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                            onClick={() => setActiveTab("products")}
                        >
                            Products Listing
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === "exchangeOffers"
                                ? "bg-white shadow text-indigo-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                            onClick={() => setActiveTab("exchangeOffers")}
                        >
                            Exchange Offers
                        </button>
                        </div>

                        <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search products..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        </div>
                    </div>
                    </div>


                    {/* Mobile Layout */}
                    <div className="md:hidden flex flex-col justify-center h-full py-1">
                        <div className="relative mb-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search products..."
                                className="pl-10 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex justify-center">
                            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                                <button
                                    className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                                        activeTab === "products"
                                            ? "bg-white shadow text-indigo-600"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                    onClick={() => setActiveTab("products")}
                                >
                                    Products
                                </button>
                                <button
                                    className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                                        activeTab === "exchangeOffers"
                                            ? "bg-white shadow text-indigo-600"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                    onClick={() => setActiveTab("exchangeOffers")}
                                >
                                    Offers
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Adjusted padding */}
            <div className="container mx-auto px-4 pt-[88px] pb-6 md:pt-[72px]">
                {loading ? (
                    <div className="text-center text-xl text-gray-500">
                        Loading...
                    </div>
                ) : activeTab === "products" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts && filteredProducts.length > 0 ? (
                            filteredProducts.map((productItem) => (
                                <ShoppingProductTile
                                    key={productItem._id}
                                    product={productItem}
                                />
                            ))
                        ) : (
                            <p className="col-span-full text-center text-gray-400">
                                {searchQuery ? "No products match your search" : "No products available"}
                            </p>
                        )}
                    </div>
                ) : (
                    <SellerExchangeOffers />
                )}
            </div>
        </div>
    );
}

export default ShoppingListing;