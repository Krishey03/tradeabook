import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Sheet } from "@/components/ui/sheet";
import { addProductFormElements } from "@/config";
import { Fragment, useEffect, useState } from "react";
import ProductImageUpload from "../../components/admin-view/image-upload";
import { useDispatch, useSelector } from "react-redux";
import { addNewProduct, fetchAllProducts } from "@/store/admin/products-slice";
import { PlusCircle } from "lucide-react";

function AdminProducts() {
  const { user } = useSelector((state) => state.auth);

  const initialFormData = {
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publicationDate: "",
    edition: "",
    description: "",
    minBid: "",
    seller: user?.userName || "",
    sellerEmail: user?.email || "",
    image: null,
  };

  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);

  const dispatch = useDispatch();

  function onSubmit(event) {
    event.preventDefault();
    dispatch(
      addNewProduct({
        ...formData,
        image: uploadedImageUrl,
        currentBid: formData.minBid,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
        setOpenCreateProductsDialog(false);
        setImageFile(null);
        setFormData(initialFormData);
      }
    });
  }

  function isFormValid() {
    return Object.values(formData).every((value) => value !== "");
  }

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  return (
    <Fragment>
      <div className="mb-5 flex justify-end">
        <Button 
          onClick={() => setOpenCreateProductsDialog(true)} 
          className="bg-primary text-white hover:bg-primary-dark transition-all flex items-center gap-2 px-4 py-2 rounded-lg shadow-md"
        >
          <PlusCircle className="h-5 w-5" />
          Add New Product
        </Button>
      </div>

      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setFormData(initialFormData);
        }}
      >
        <SheetContent
          side="right"
          className="overflow-auto bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl transition-all duration-300"
        >
          <SheetHeader className="text-xl font-semibold text-gray-900 dark:text-white">
            Upload a Product
          </SheetHeader>

          <div className="border-b border-gray-300 dark:border-gray-700 my-4"></div>

          <div className="flex flex-col gap-4">
            <ProductImageUpload
              imageFile={imageFile}
              setImageFile={setImageFile}
              uploadedImageUrl={uploadedImageUrl}
              setUploadedImageUrl={setUploadedImageUrl}
              setImageLoadingState={setImageLoadingState}
              imageLoadingState={imageLoadingState}
            />

            <div className="py-4">
              <CommonForm
                buttonText="Upload Product"
                onSubmit={onSubmit}
                formData={formData}
                setFormData={setFormData}
                formControls={addProductFormElements}
                isBtnDisabled={!isFormValid()}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
