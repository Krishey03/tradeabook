import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { addNewProduct } from "@/store/admin/products-slice"
import ProductImageUpload from "@/components/admin-view/image-upload"
import { Dialog } from "@/components/ui/dialog"
import { DialogContent } from "@/components/ui/dialog"
import { CheckCircle2 } from "lucide-react"

export default function ProductUpload() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

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
  }

  const [formData, setFormData] = useState(initialFormData)
  const [imageFile, setImageFile] = useState(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState("")
  const [imageLoadingState, setImageLoadingState] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  function handleInputChange(e) {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    setUploadError(null)
    
    if (!uploadedImageUrl) {
      setUploadError("Please upload an image first")
      setIsSubmitting(false)
      return
    }

    try {
      const productData = {
        ...formData,
        image: uploadedImageUrl,
        currentBid: formData.minBid,
      }

      const result = await dispatch(addNewProduct(productData)).unwrap()
      
      if (result.success) {
        setUploadSuccess(true)
        // Reset form on success
        setFormData(initialFormData)
        setImageFile(null)
        setUploadedImageUrl("")
      }
    } catch (error) {
      setUploadError(error.message || "Failed to upload product. Please try again.")
      console.error("Upload error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  function isFormValid() {
    return (
      formData.title &&
      formData.author &&
      formData.description &&
      formData.minBid &&
      uploadedImageUrl
    )
  }

  return (
    <div className="min-h-screen bg-[#ffffff]">
      {/* Success Dialog */}
      <Dialog open={uploadSuccess} onOpenChange={setUploadSuccess}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center p-6">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Product Uploaded Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Your product has been listed successfully. Buyers can now view and bid on it.
            </p>
            <Button
              onClick={() => setUploadSuccess(false)}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      {uploadError && (
        <Dialog open={!!uploadError} onOpenChange={() => setUploadError(null)}>
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center text-center p-6">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Failed</h3>
              <p className="text-gray-600 mb-6">{uploadError}</p>
              <Button
                onClick={() => setUploadError(null)}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Try Again
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload Area */}
          <div className="space-y-6">
            {/* Upload Area */}
            <ProductImageUpload
              imageFile={imageFile}
              setImageFile={setImageFile}
              uploadedImageUrl={uploadedImageUrl}
              setUploadedImageUrl={setUploadedImageUrl}
              imageLoadingState={imageLoadingState}
              setImageLoadingState={setImageLoadingState}
              isCustomStyling={true}
            />

            {/* Important Notice */}
            <div className="border border-[#d9d9d9] rounded-lg p-4 bg-[#ffffff]">
              <h3 className="font-semibold text-[#000000] mb-2">Important:</h3>
              <p className="text-sm text-[#000000] leading-relaxed">
                A valid WhatsApp account is required in order for potential customers to contact you.
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={onSubmit}>
              <div className="border border-[#d9d9d9] rounded-lg p-6">
                {/* Header Info */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#d9d9d9]">
                  <div className="text-[#000000]">
                    <span className="font-medium">Seller name:</span> {user?.userName || "Not available"}
                  </div>
                  <div className="text-red-500 font-medium">
                    <span className="text-[#000000]">Time:</span> 2d 12h 60m
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-[#000000] font-medium">
                        Title*
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter title"
                        className="mt-1 border-[#d9d9d9] placeholder:text-[#808080]"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="author" className="text-[#000000] font-medium">
                        Author*
                      </Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={handleInputChange}
                        placeholder="Enter author name"
                        className="mt-1 border-[#d9d9d9] placeholder:text-[#808080]"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="publisher" className="text-[#000000] font-medium">
                        Publisher
                      </Label>
                      <Input
                        id="publisher"
                        value={formData.publisher}
                        onChange={handleInputChange}
                        placeholder="Enter publisher name"
                        className="mt-1 border-[#d9d9d9] placeholder:text-[#808080]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="publicationDate" className="text-[#000000] font-medium">
                        Publication date
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="publicationDate"
                          value={formData.publicationDate}
                          onChange={handleInputChange}
                          placeholder="DD/MM/YYYY"
                          className="border-[#d9d9d9] placeholder:text-[#808080] pr-10"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#808080]" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="minBid" className="text-[#000000] font-medium">
                        Starting bid*
                      </Label>
                      <Input
                        id="minBid"
                        type="number"
                        value={formData.minBid}
                        onChange={handleInputChange}
                        placeholder="Set starting bid"
                        className="mt-1 border-[#d9d9d9] placeholder:text-[#808080]"
                        required
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="description" className="text-[#000000] font-medium">
                        Description*
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter Description"
                        className="mt-1 border-[#d9d9d9] placeholder:text-[#808080] min-h-[120px] resize-none"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="isbn" className="text-[#000000] font-medium">
                        ISBN
                      </Label>
                      <Input
                        id="isbn"
                        value={formData.isbn}
                        onChange={handleInputChange}
                        placeholder="Enter ISBN number"
                        className="mt-1 border-[#d9d9d9] placeholder:text-[#808080]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edition" className="text-[#000000] font-medium">
                        Edition
                      </Label>
                      <Input
                        id="edition"
                        value={formData.edition}
                        onChange={handleInputChange}
                        placeholder="Enter edition"
                        className="mt-1 border-[#d9d9d9] placeholder:text-[#808080]"
                      />
                    </div>

                    {/* Upload Button */}
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full bg-[#2f27ce] hover:bg-[#2f27ce]/90 text-white font-medium py-3"
                        disabled={!isFormValid() || isSubmitting || imageLoadingState}
                      >
                        {isSubmitting ? "Uploading..." : "Upload Product"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}