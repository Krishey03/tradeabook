import { useEffect, useState } from "react";
import api from "@/api/axios";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ShoppingUploads() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate("/shop/product-upload"); // change this to your desired route
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/shop/products/get");
        console.log("Response from backend:", res.data);

        const allProducts = res.data?.data;
        if (!Array.isArray(allProducts)) {
          console.error("Expected an array but got:", allProducts);
          return;
        }

        // Filter the products by the logged-in user's email
        const userProducts = allProducts.filter(
          (product) => product.sellerEmail?.trim().toLowerCase() === user.email.trim().toLowerCase()
        );
        console.log("Filtered products:", userProducts);

        setProducts(userProducts);
      } catch (err) {
        console.error("Error fetching products", err);
      }
    };

    fetchProducts();
  }, [user]);

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header with Upload Button and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
  {/* Heading alone */}
  <h2 className="text-center text-2xl font-semibold mb-6 sm:mb-0">
    Your Listed Products
  </h2>

  {/* Group: Upload + Search */}
  <div className="flex flex-col sm:flex-row items-center gap-4">
    {/* Upload Button */}
    <Button
      onClick={handleUploadClick}
      className="flex items-center gap-2 bg-[#DEDCFF] text-black hover:bg-[#BFB9FF] transition-colors"
    >
      Upload Book
    </Button>

    {/* Search Bar */}
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="search"
        placeholder="Search your products..."
        className="pl-10"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  </div>
</div>


      
      
      {filteredProducts.length === 0 ? (
        <p className="text-center">
          {searchQuery ? "No products match your search" : "You have not listed any products yet."}
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <li key={product._id} className="p-4 border rounded-lg shadow-md bg-white">
              <div className="relative w-full h-48 overflow-hidden rounded-lg mb-2">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <strong>{product.title}</strong>
                <br/>
                Minimum Bid: ${product.minBid} <br />
                Recent Bid: ${product.currentBid ?? "None yet"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ShoppingUploads;