import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Sheet } from "@/components/ui/sheet";
import { addProductFormElements } from "@/config";
import { Fragment, useEffect, useState  } from "react";
import ProductImageUpload from "../../components/admin-view/image-upload";
import { useDispatch, useSelector } from "react-redux";
import { addNewProduct, fetchAllProducts } from "@/store/admin/products-slice";
import { ChevronLeft, ChevronLeftIcon, ChevronRightIcon, PlusCircle } from "lucide-react";
import bannerOne from '../../assets/book1.jpg'
import bannerTwo from '../../assets/book2.jpg'
import bannerThree from '../../assets/book3.jpg'
import "@fontsource/inspiration"; 
import "@fontsource/inika"; 
import "@fontsource/nunito-sans"
import "@fontsource/julius-sans-one"
import { fetchAllUserProducts } from "@/store/shop/products-slice";
import ShoppingProductTile from "./product-tile";
import Footer from './footer'

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
    sellerPhone: user?.phone || "",
     image: null,
    offerTime: { type: Date, default: Date.now },
    endTime: new Date(Date.now() + 2 * 1000),
  };

  console.log("User Phone Number:", user?.phone);
  console.log(user, "user")

  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const slides = [bannerOne, bannerTwo, bannerThree]
  const {productList} = useSelector(state=> state.shopProductsSlice)

  const dispatch = useDispatch();

     useEffect(() => {
         dispatch(fetchAllUserProducts());
     }, [dispatch])
  
  console.log(productList, "productlist")

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
      <div className="relative w-full h-[600px] overflow-hidden">
  {slides.map((slide, index) => (
    <img
    src={bannerTwo} 
    alt="Banner Three" 
      className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000"
    />
  ))}

  {/* Overlay for text and button */}
  <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50 p-6">
    <h1 className="text-4xl font-bold mb-4 text-center font-nunito">
    Welcome to <span className="font-extrabold font-inspiration">Trade a Book</span>
    </h1>
    <p className="text-lg text-center max-w-2xl font-nunito">
      Buy, sell, or exchange books effortlessly. Find your next read today!
    </p>
    <div className="absolute top-5 right-5 z-10">
    <Button 
      onClick={() => setOpenCreateProductsDialog(true)} 
      className="bg-primary text-white hover:bg-primary-dark transition-all flex items-center gap-2 px-4 py-2 rounded-lg shadow-md mt-6"
    >
      <PlusCircle className="h-5 w-5" />
      Add New Product
    </Button>
    </div>
  </div>
</div>

<section className="py-12 flex justify-center">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-julius text-center mb-8">
      Available Books
    </h2>
    <div className="flex justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productList && productList.length > 0
          ? productList.slice(0, 3).map(productItem => (
              <ShoppingProductTile key={productItem.id} product={productItem} />
            ))
          : <p className="text-center w-full">No products available.</p>}
      </div>
    </div>
  </div>
</section>

<section className="flex pb-[300px] items-center justify-center min-h-screen py-12">
  <div className="container mx-auto px-4 flex flex-col items-center">
    <h2 className="text-3xl font-julius text-center mb-8">
      Think of Something
    </h2>

    <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
      <img 
        src={bannerThree} 
        alt="Banner Three" 
        className="w-[300px] h-auto shadow-md"
      />

      <p className="font-nunito text-xl max-w-lg text-center md:text-left">
        There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.
      </p>
    </div>
  </div>
</section>
<Footer />

      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setFormData(initialFormData);
        }}
      >
        <SheetContent
          side="right"
          className="overflow-auto bg-slate-200 dark:ring-offset-white p-6 rounded-lg shadow-xl transition-all duration-300"
        >
          <SheetHeader className="text-xl font-semibold text-gray-900 dark:text-black">
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
