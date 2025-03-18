import { Card, CardContent } from "@/components/ui/card";

function ShoppingProductTile({ product, handleGetProductDetails }) {
    return (
        <Card className="w-full max-w-sm mx-auto">
            <div onClick={()=>handleGetProductDetails(product?._id)} className="cursor-pointer">
                <div className="relative">
                    <img 
                        src={product.image}
                        alt={product.title}
                        className="w-full h-[300px] object-cover rounded-t-lg"
                    />
                    <hr/>
                </div>
            </div>
            
            <CardContent className="p-4">
                <h2 className="text-xl font-bold mb-2">{product?.title}</h2>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{product?.description}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-primary">Rs. {product?.currentBid}</span>
                </div>
            </CardContent>
        </Card>
    );
}

export default ShoppingProductTile;
