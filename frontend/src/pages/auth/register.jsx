import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import CommonForm from "@/components/common/form"
import { registerFormControls } from "@/config"
import { registerUser } from "@/store/auth-slice"
import { useDispatch } from "react-redux"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const initialState = {
  userName: "",
  email: "",
  password: "",
  phone: "",
  address: "",
}

function AuthRegister() {
  const [formData, setFormData] = useState(initialState)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { toast } = useToast()

  async function onSubmit(event) {
    event.preventDefault()

    if (!termsAccepted) {
      toast({
        title: "Terms Not Accepted",
        description: "You must accept the Terms and Conditions to register.",
        status: "error",
      })
      return
    }

    setLoading(true)

    try {
      const data = await dispatch(registerUser(formData)).unwrap()
      if (data?.success) {
        toast({
          title: "Registration Successful",
          description: "You can now log in!",
          status: "success",
        })
        navigate("/auth/login")
      } else {
        toast({
          title: "Registration Failed",
          description: data?.message || "Something went wrong!",
          status: "error",
        })
      }
    } catch (error) {
      toast({
        title: "Registration Error",
        description: error?.message || "An unexpected error occurred.",
        status: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-md border-0">
      <CardHeader className="pb-4 space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
        <p className="text-sm text-center text-gray-600">
          Already have an account?
          <Link to="/auth/login" className="ml-1 font-medium text-[#7C8E76] hover:underline">
            Login
          </Link>
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={onSubmit} className="space-y-3">
          <CommonForm
            formControls={registerFormControls}
            formData={formData}
            setFormData={setFormData}
            buttonDisabled={loading}
            showButton={false}
          />

          <div className="flex items-start gap-2 mt-2">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-xs text-gray-600">
              I agree to the{" "}
              <Link to="/terms" className="text-[#7C8E76] underline">
                Terms and Conditions
              </Link>
            </label>
          </div>

          <Button className="w-full bg-[#7C8E76] hover:bg-[#6A7A65]" type="submit" disabled={!termsAccepted || loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default AuthRegister
