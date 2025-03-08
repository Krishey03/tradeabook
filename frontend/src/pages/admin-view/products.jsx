import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sheet } from "@/components/ui/sheet";
import { addProductFormElements } from "@/config";
import { Fragment, useEffect, useState } from "react";
import ProductImageUpload from "../../components/admin-view/image-upload";
import { useDispatch, useSelector } from "react-redux";
import { addNewProduct, deleteProduct, editProduct, fetchAllProducts } from "@/store/admin/products-slice";
import AdminProductTile from "@/components/admin-view/product-tile";

function AdminProducts() {

    const { user } = useSelector((state) => state.auth);
    const { userEmail } = useSelector((state) => state.auth);

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
      const [currentEditedId, setCurrentEditedId] = useState(null);
      const { productList } = useSelector((state) => state.adminProducts);
      
      const dispatch = useDispatch();

    function onSubmit(event) {
        event.preventDefault();
    
        currentEditedId !== null
          ? dispatch(
              editProduct({
                id: currentEditedId,
                formData,
              })
            ).then((data) => {
              console.log(data, "edit");
    
              if (data?.payload?.success) {
                dispatch(fetchAllProducts());
                setFormData(initialFormData);
                setOpenCreateProductsDialog(false);
                setCurrentEditedId(null);
              }
            })
          : dispatch(
              addNewProduct({
                ...formData,
                image: uploadedImageUrl,
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

      function handleDelete(getCurrentProductId) {
        dispatch(deleteProduct(getCurrentProductId)).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
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
      {/* Admin Add product */}
        {/* <div className="mb-5 flex justify-end">
            <Button onClick={()=>setOpenCreateProductsDialog(true)} className="text-white">Add new Product</Button>
        </div> */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductTile
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleDelete={handleDelete}
              />
            ))
          : null}
      </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto text-white bg-black p-6 rounded-lg shadow-xl transition-all duration-300">
                <SheetHeader>
                  {currentEditedId !== null ? "Edit Product" : "Add New Product"}
                </SheetHeader>
                <ProductImageUpload 
                  imageFile={imageFile}
                  setImageFile={setImageFile}
                  uploadedImageUrl={uploadedImageUrl}
                  setUploadedImageUrl={setUploadedImageUrl}
                  setImageLoadingState={setImageLoadingState}
                  imageLoadingState={imageLoadingState}
                  isEditMode={currentEditedId !== null}
                />
                <div className="py-6">
                    <CommonForm 
                      buttonText={currentEditedId !== null ? "Edit" : "Add"} 
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