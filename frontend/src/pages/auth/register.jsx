import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CommonForm from "@/components/common/form";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice";
import { useDispatch } from 'react-redux';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const initialState = {
    userName: '',
    email: '',
    password: '',
    phone: '',
    address: ''
};

function AuthRegister() {
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { toast } = useToast();

    async function onSubmit(event) {
        event.preventDefault();
        setLoading(true);

        try {
            const data = await dispatch(registerUser(formData)).unwrap();
            console.log("Registration Response:", data);

            if (data?.success) {
                toast({
                    title: "Registration Successful",
                    description: "You can now log in!",
                    status: "success",
                });
                navigate('/auth/login');
            } else {
                toast({
                    title: "Registration Failed",
                    description: data?.message || "Something went wrong!",
                    status: "error",
                });
            }
        } catch (error) {
            console.error("Registration Error:", error);
            toast({
                title: "Registration Error",
                description: error?.message || "An unexpected error occurred.",
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
<div className="flex min-h-screen items-start justify-center px-4">
    <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold">Create an Account!</CardTitle> {/* Increased font size */}
            <p className="mt-3 text-base text-gray-600">
                Already have an account? 
                <Link to="/auth/login" className="ml-1 font-medium text-primary hover:underline">
                    Login
                </Link>
            </p>
        </CardHeader>
        <CardContent>
            <CommonForm
                formControls={registerFormControls}
                buttonText={loading ? "Signing Up..." : "Sign Up"}
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

export default AuthRegister;
