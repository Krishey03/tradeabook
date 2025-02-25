import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sheet } from "@/components/ui/sheet";
import { addProductFormElements } from "@/config";
import { Fragment, useEffect, useState } from "react";
import ProductImageUpload from "../../components/admin-view/image-upload";
import { useDispatch, useSelector } from "react-redux";
import { addNewProduct, fetchAllProducts } from "@/store/admin/products-slice";

const initialFormData= {
    image: null,
    title: '',
    description: '',
    category: '',
    author: '',
    minBid: ''
}

function AdminProducts() {

    const[openCreateProductsDialog,setOpenCreateProductsDialog] = useState(false)
    const[formData,setFormData] = useState(initialFormData)
    const[imageFile, setImageFile] = useState(null)
    const[uploadedImageUrl, setUploadedImageUrl] = useState("")
    const[imageLoadingState, setImageLoadingState] = useState(false)
    const{productList} = useSelector(state=>state.adminProducts)
    const dispatch = useDispatch()

    function onSubmit(event){
        event.preventDefault()
        dispatch(addNewProduct({
            ...formData,
            image: uploadedImageUrl
        })).then((data)=>{
            console.log(data)})
    }

    useEffect(()=>{
        dispatch(fetchAllProducts())
    },[dispatch])

    console.log(productList, "productList", uploadedImageUrl);
    

    return <Fragment>
        <div className="mb-5 flex justify-end">
            <Button onClick={()=>setOpenCreateProductsDialog(true)} className="text-white">Add new Product</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4"></div>
        <Sheet open={openCreateProductsDialog} onOpenChange={()=>{setOpenCreateProductsDialog(false)}}>
            <SheetContent side="right" className="overflow-auto text-white">
                <SheetHeader>
                    <SheetTitle className="text-white">Add new Product</SheetTitle>
                </SheetHeader>
                <ProductImageUpload 
                imageFile={imageFile} 
                setImageFile={setImageFile} 
                uploadedImageUrl={uploadedImageUrl} 
                setImageLoadingState={setImageLoadingState} 
                setUploadedImageUrl={setUploadedImageUrl}
                imageLoadingState={imageLoadingState}
                />
                <div className="py-6">
                    <CommonForm onSubmit={onSubmit} formData={formData} setFormData={setFormData} buttonText='Add'
                    formControls={addProductFormElements}
                    />
                </div>
            </SheetContent>
        </Sheet>
    </Fragment>
}

export default AdminProducts;