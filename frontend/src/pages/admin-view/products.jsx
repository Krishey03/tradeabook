"use client"

import CommonForm from "@/components/common/form"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent as SheetContentPrimitive,
  SheetHeader as SheetHeaderPrimitive,
} from "@/components/ui/sheet"
import { addProductFormElements } from "@/config"
import { Fragment, useEffect, useState } from "react"
import ProductImageUpload from "../../components/admin-view/image-upload"
import { useDispatch, useSelector } from "react-redux"
import { addNewProduct, deleteProduct, editProduct, fetchAllProducts } from "@/store/admin/products-slice"
import AdminProductTile from "@/components/admin-view/product-tile"
import { Search } from "lucide-react"

function AdminProducts() {
  const { user } = useSelector((state) => state.auth)
  const { userEmail } = useSelector((state) => state.auth)
  const { userPhone } = useSelector((state) => state.auth)
  const [searchTerm, setSearchTerm] = useState("")

  const initialFormData = {
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publicationDate: "",
    edition: "",
    description: "",
    minBid: "",
    seller: user?.userName,
    sellerEmail: userEmail?.email,
    sellerPhone: userPhone?.phone,
    currentBid: "",
    image: null,
    bidderEmail: "",
    winnerEmail: "",
  }

  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [imageFile, setImageFile] = useState(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState("")
  const [imageLoadingState, setImageLoadingState] = useState(false)
  const [currentEditedId, setCurrentEditedId] = useState(null)
  const { productList } = useSelector((state) => state.adminProducts)

  const dispatch = useDispatch()

  // Filter products based on search term
  const filteredProducts = productList?.filter(
    (product) =>
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.isbn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.publisher?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      currentBid: prev.minBid || "",
    }))
  }, [formData.minBid])

  function onSubmit(event) {
    event.preventDefault()

    currentEditedId !== null
      ? dispatch(
          editProduct({
            id: currentEditedId,
            formData,
          }),
        ).then((data) => {
          console.log(data, "edit")

          if (data?.payload?.success) {
            dispatch(fetchAllProducts())
            setFormData(initialFormData)
            setOpenCreateProductsDialog(false)
            setCurrentEditedId(null)
          }
        })
      : dispatch(
          addNewProduct({
            ...formData,
            image: uploadedImageUrl,
          }),
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts())
            setOpenCreateProductsDialog(false)
            setImageFile(null)
            setFormData(initialFormData)
          }
        })
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts())
      }
    })
  }

  function isFormValid() {
    const requiredFields = [
      "title",
      "author",
      "isbn",
      "publisher",
      "publicationDate",
      "edition",
      "description",
      "minBid",
      "seller",
      "sellerEmail",
      "sellerPhone",
    ]

    return requiredFields.map((key) => formData[key] !== "").every((item) => item)
  }

  useEffect(() => {
    dispatch(fetchAllProducts())
  }, [dispatch])

  return (
    <Fragment>
      {/* Search and Add Product Header */}
      <div className="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search books by title, author, ISBN..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setOpenCreateProductsDialog(true)} className="text-white">
          Add new Product
        </Button>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="mb-3 text-sm text-gray-500">
          Found {filteredProducts?.length || 0} results for "{searchTerm}"
        </div>
      )}

      {/* Product Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filteredProducts && filteredProducts.length > 0 ? (
          filteredProducts.map((productItem) => (
            <AdminProductTile
              key={productItem._id}
              setFormData={setFormData}
              setOpenCreateProductsDialog={setOpenCreateProductsDialog}
              setCurrentEditedId={setCurrentEditedId}
              product={productItem}
              handleDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            {searchTerm ? "No products match your search criteria" : "No products available"}
          </div>
        )}
      </div>

      {/* Add/Edit Product Sheet */}
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false)
          setCurrentEditedId(null)
          setFormData(initialFormData)
        }}
      >
        <SheetContentPrimitive
          side="right"
          className="overflow-auto text-white bg-black p-6 rounded-lg shadow-xl transition-all duration-300"
        >
          <SheetHeaderPrimitive>{currentEditedId !== null ? "Edit Product" : "Add New Product"}</SheetHeaderPrimitive>
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
        </SheetContentPrimitive>
      </Sheet>
    </Fragment>
  )
}

export default AdminProducts
