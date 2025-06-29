import { useEffect, useState } from "react";
import api from "@/api/axios";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function ShoppingUploads() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate("/shop/product-upload");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/shop/products/get");
        const allProducts = res.data?.data;
        if (!Array.isArray(allProducts)) {
          console.error("Expected an array but got:", allProducts);
          return;
        }

        const userProducts = allProducts.filter(
          (product) =>
            product.sellerEmail?.trim().toLowerCase() ===
            user.email.trim().toLowerCase()
        );
        setProducts(userProducts);
      } catch (err) {
        console.error("Error fetching products", err);
      }
    };

    fetchProducts();
  }, [user]);

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Fixed Header */}
      <div className="fixed left-0 right-0 z-40 bg-white shadow-sm h-[72px] md:h-[64px] border-t">
        <div className="container mx-auto px-4 pt-[10px] md:pt-[10px] pb-6">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between h-full">
            <h2 className="text-center text-2xl font-semibold">
              Your Listed Products
            </h2>

            {/* Upload button left, search bar right */}
            <div className="flex items-center gap-4">
              <Button
                onClick={handleUploadClick}
                className="flex items-center gap-2 bg-[#DEDCFF] text-black hover:bg-[#BFB9FF] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Upload Book
              </Button>

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
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button
              onClick={handleUploadClick}
              className="w-full flex items-center justify-center gap-2 bg-[#DEDCFF] text-black hover:bg-[#BFB9FF] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Upload Book
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with padding */}
      <div className="pt-[72px] md:pt-[64px]">
        <div className="container mx-auto px-4 pb-12">
          {/* Mobile heading */}
          <div className="block md:hidden mb-4">
            <h2 className="text-xl font-semibold text-center">Your Listed Products</h2>
          </div>

          {filteredProducts.length === 0 ? (
            <p className="text-center text-gray-400 mt-6">
              {searchQuery
                ? "No products match your search"
                : "You have not listed any products yet."}
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="p-4 border rounded-lg shadow-md bg-white"
                >
                  <div className="relative w-full h-48 overflow-hidden rounded-lg mb-2">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <strong>{product.title}</strong>
                    <br />
                    Minimum Bid: ${product.minBid} <br />
                    Recent Bid: ${product.currentBid ?? "None yet"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShoppingUploads;
