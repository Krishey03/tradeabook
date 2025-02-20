

// function ShoppingHome(){
//     return(
//         <div>Shopping Home Page</div>
//     );

// }

// export default ShoppingHome;

import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sheet } from "@/components/ui/sheet";
import { addProductFormElements } from "@/config";
import { Fragment, useState } from "react";

const initialFormData= {
    image: null,
    title: '',
    description: '',
    category: '',
    brand: '',
    price: "",
    salePrice: '',
    totalStock: ''
}

function AdminProducts() {

    const[openCreateProductsDialog,setOpenCreateProductsDialog] = useState(false)
    const[formData,setFormData] = useState(initialFormData)

    function onSubmit(){

    }

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
                <div className="py-6">
                    <CommonForm onSubmit={onSubmit} formData={formData} setFormData={setFormData} buttonText='Add'
                    formControls={addProductFormElements}
                    />
                    console.log("Hey")
                </div>
            </SheetContent>
        </Sheet>
    </Fragment>
}

export default AdminProducts;