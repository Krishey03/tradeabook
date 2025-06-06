import { useEffect, useState } from "react";
import api from "@/api/axios";
import { useSelector } from "react-redux";

function ShoppingUploads() {
  const [products, setProducts] = useState([]);
  const userEmail = "bhattaraikrish478@gmail.com"; // Replace this with dynamic data
  const { user } = useSelector((state) => state.auth); // Get user from Redux

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-center text-2xl font-semibold mb-6">Your Listed Products</h2>
      {products.length === 0 ? (
        <p className="text-center">You have not listed any products yet.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
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
