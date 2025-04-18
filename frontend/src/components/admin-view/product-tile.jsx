import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  return (
    <Card className="w-full max-w-sm mx-auto shadow-md border border-gray-300">
      <div>
        <div className="relative">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-[250px] object-cover rounded-t-lg"
          />
        </div>
        <CardContent className="space-y-2 p-4">
          <h2 className="text-xl font-bold">{product?.title}</h2>
          <p className="text-sm text-gray-500">by {product?.author}</p>
          <p className="text-sm"><strong>ISBN:</strong> {product?.isbn}</p>
          <p className="text-sm"><strong>Publisher:</strong> {product?.publisher}</p>
          <p className="text-sm"><strong>Edition:</strong> {product?.edition}</p>
          <p className="text-sm"><strong>Publication Date:</strong> {product?.publicationDate}</p>
          <p className="text-sm"><strong>Description:</strong> {product?.description}</p>
          <hr className="my-2" />
          <p className="text-sm"><strong>Min Bid:</strong> ${product?.minBid}</p>
          <p className="text-sm"><strong>Current Bid:</strong> ${product?.currentBid}</p>
          <p className="text-sm"><strong>Bidder Email:</strong> {product?.bidderEmail}</p>
          <p className="text-sm"><strong>End Time:</strong> {new Date(product?.endTime).toLocaleString()}</p>
          <hr className="my-2" />
          <p className="text-sm text-gray-600"><strong>Seller:</strong> {product?.seller}</p>
          <p className="text-sm text-gray-600"><strong>Email:</strong> {product?.sellerEmail}</p>
          <p className="text-sm text-gray-600"><strong>Phone:</strong> {product?.sellerPhone}</p>
          <p className="text-sm"><strong>Winner Email:</strong> {product?.winnerEmail}</p>
          <p className="text-sm"><strong>Payment Status:</strong> {product?.paymentStatus}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center p-4">
          <Button
            onClick={() => {
              setOpenCreateProductsDialog(true);
              setCurrentEditedId(product?._id);
              setFormData(product);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Edit
          </Button>
          <Button variant="destructive" onClick={() => handleDelete(product?._id)} className="bg-red-500 hover:bg-red-600">
            Delete
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}

export default AdminProductTile;
