import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sheet } from "@/components/ui/sheet";
import { addProductFormElements } from "@/config";
import { Fragment, useEffect, useState } from "react";
import ProductImageUpload from "../../components/admin-view/image-upload";
import { useDispatch, useSelector } from "react-redux";
import { addNewProduct, fetchAllProducts } from "@/store/admin/products-slice";


function AdminProducts() {

const { user, userEmail } = useSelector((state) => state.auth);

  const initialFormData = {
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationDate: '',
    edition: '',
    description: '',
    minBid: '',
    seller: user?.userName,
    sellerEmail: userEmail?.email,
    image: null,
    
  };

      const [openCreateProductsDialog, setOpenCreateProductsDialog] =
        useState(false);
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
                currentBid: formData.minBid
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
        return Object.keys(formData)
          .map((key) => formData[key] !== "")
          .every((item) => item);
      }
    
      useEffect(() => {
        dispatch(fetchAllProducts());
      }, [dispatch]);
    
      console.log(formData, "productList");
    

    return <Fragment>
        <div className="mb-5 flex justify-end">
            <Button onClick={()=>setOpenCreateProductsDialog(true)} className="text-white">Add new Product</Button>
        </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setFormData(initialFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto text-white bg-black p-6 rounded-lg shadow-xl transition-all duration-300">
                <SheetHeader>
                  Upload a Product
                </SheetHeader>
                <ProductImageUpload 
                  imageFile={imageFile}
                  setImageFile={setImageFile}
                  uploadedImageUrl={uploadedImageUrl}
                  setUploadedImageUrl={setUploadedImageUrl}
                  setImageLoadingState={setImageLoadingState}
                  imageLoadingState={imageLoadingState}
                />
                <div className="py-6">
                    <CommonForm 
                      buttonText="Upload"
                      onSubmit={onSubmit} 
                      formData={formData} 
                      setFormData={setFormData} 
                      formControls={addProductFormElements}
                      isBtnDisabled={!isFormValid()}
                    />
                </div>
            </SheetContent>
        </Sheet>
    </Fragment>
}

export default AdminProducts;