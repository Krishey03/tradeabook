import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";


function ProductDetailsDialog(open, setOpen, productDetails) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="grid grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw]">

            {/* <DialogTitle>
                    <VisuallyHidden>{productDetails?.title}</VisuallyHidden>
                </DialogTitle> */}

                <div className="relative overflow-hidden rounded-lg">
                    <img 
                        src={productDetails?.img}
                        alt={productDetails?.title}
                        width={600}
                        height={600}
                        className="aspect-square w-full object-cover "
                    />
                </div>
                <div className="grid gap-6">
                    <h1 className="text-3xl font-extrabold">{productDetails?.title}</h1>
                    <p className="text-muted-foreground">{productDetails?.description}</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ProductDetailsDialog