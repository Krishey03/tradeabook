import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";


function ProductDetailsDialog({ open, setOpen, productDetails }) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="grid grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw]">
                <div className="relative overflow-hidden rounded-lg">
                    <img 
                        src={productDetails?.image}
                        alt={productDetails?.title}
                        width={600}
                        height={600}
                        className="aspect-square w-full object-cover "
                    />
                </div>
                <div className="grid gap-6">
                    <h1 className="text-3xl font-extrabold">Title: {productDetails?.title}</h1>
                    <p className="text-muted-foreground">Author: {productDetails?.author}</p>
                    <p className="text-muted-foreground">ISBN: {productDetails?.isbn}</p>
                    <p className="text-muted-foreground">Publisher: {productDetails?.publisher}</p>
                    <p className="text-muted-foreground">Publication Date: {productDetails?.publicationDate}</p>
                    <p className="text-muted-foreground">Edition: {productDetails?.edition}</p>
                    <p className="text-muted-foreground">description: {productDetails?.description}</p>
                    <p className="text-muted-foreground">Seller: {productDetails?.seller}</p>
                    <p className="text-3xl font-bold text-primary">Minimum Bid: Rs. {productDetails?.minBid}</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}


export default ProductDetailsDialog