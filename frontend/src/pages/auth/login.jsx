import { useState } from "react";
import { Link } from "react-router-dom";
import CommonForm from "@/components/common/form";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useDispatch } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const initialState = {
    email: '',
    password: ''
};

function AuthLogin() {
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const { toast } = useToast();

    async function onSubmit(event) {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await dispatch(loginUser(formData)).unwrap();
            console.log("Full Login Response:", response);

            toast({
                title: "Login Successful",
                description: "You have successfully logged in.",
                status: "success",
            });

        } catch (error) {
            console.error("Login Error:", error);
            toast({
                title: "Login Failed",
                description: error?.message || "Invalid email or password.",
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
<div className="flex min-h-screen items-start justify-center px-4">
    <Card className="w-full max-w-lg shadow-lg p-3">
        <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold">Welcome!</CardTitle>
            <p className="mt-3 text-base text-gray-600">
                Don't have an account? 
                <Link to="/auth/register" className="ml-1 font-medium text-primary hover:underline">
                    Sign Up
                </Link>
            </p>
        </CardHeader>
        <CardContent className="space-y-4"> {/* Added spacing between elements */}
            <CommonForm
                formControls={loginFormControls}
                buttonText={loading ? "Signing In..." : "Login"}
                formData={formData}
                setFormData={setFormData}
                onSubmit={onSubmit}
                buttonDisabled={loading}
            />
        </CardContent>
    </Card>
</div>



    );
}

export default AuthLogin;
