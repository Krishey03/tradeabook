import { fetchAllUserProducts, fetchProductDetails, setProductDetails } from "@/store/shop/products-slice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ShoppingProductTile from "./product-tile";
import ProductDetailsDialog from "@/pages/shopping-view/product-details";


function ShoppingListing(){
    const dispatch = useDispatch();
    const {productList, productDetails} = useSelector((state)=>state.shopProductsSlice)
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false)
    
    useEffect(()=>{
        dispatch(fetchAllUserProducts())
    }, [dispatch])

    function handleGetProductDetails(getCurrentProductId){
        console.log(getCurrentProductId)
        dispatch (fetchProductDetails(getCurrentProductId))
    }

    console.log(productList, 'productList')
    console.log(productDetails, 'productDetails')

    useEffect(() => {
        if (productDetails !== null) setOpenDetailsDialog(true);
      }, [productDetails])

    return (
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 p-4 md:p-6">
            <div className="bg-background w-full rounedd-lg shadow-sm">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-extrabold">Products</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">No of Products: {productList.length}</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {productList && productList.length > 0
            ? productList.map((productItem) => (
                <ShoppingProductTile
                  handleGetProductDetails={handleGetProductDetails}
                  product={productItem}
                />
              ))
            : null}
        </div>
            <ProductDetailsDialog 
                open={openDetailsDialog} 
                setOpen={setOpenDetailsDialog} 
                productDetails={productDetails}
                setProductDetails={setProductDetails}
            />
        </div>
    )

}

export default ShoppingListing;

