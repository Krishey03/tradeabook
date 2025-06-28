import { Card, CardContent } from "@/components/ui/card";
import "@fontsource/inika";
import "@fontsource/nunito-sans";
import "./footer";
import Footer from "./footer";
import { useNavigate } from "react-router-dom";

function ShoppingProductTile({ product }) {
  const navigate = useNavigate();

  return (
    <Card 
      className="w-full max-w-sm mx-auto bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer"
      onClick={() => navigate(`/shop/book/${product._id}`)}
    >
      <div className="relative">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-[240px] object-cover rounded-t-lg border-b border-gray-300"
        />
      </div>
      
      <CardContent className="p-6 flex flex-col justify-between h-[120px]">
        <h2 className="text-xl font-bold font-nunito mb-2 text-gray-900 truncate">{product.title}</h2>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-lg font-nunito text-gray-700">Rs. {product.currentBid}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default ShoppingProductTile;
