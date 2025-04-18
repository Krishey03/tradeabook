import { Route, Routes } from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminOrders from "./pages/admin-view/orders";
import AdminFeatures from "./pages/admin-view/user";
import AdminProducts from "./pages/admin-view/products";
import NotFound from "./pages/not-found";
import ShoppingLayout from "./pages/shopping-view/layout";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingAccount from "./pages/shopping-view/account";
import ShoppingUploads from "./pages/shopping-view/uploads";
import ShoppingCheckout from "./pages/shopping-view/checkout";
import ShoppingListing from "./pages/shopping-view/listing";
import ShoppingAbout from "./pages/shopping-view/about";
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./store/auth-slice";
import { Skeleton } from "@/components/ui/skeleton"
import AdminUser from "./pages/admin-view/user";
import PaymentSuccess from "./pages/paymentSuccess";
import PaymentFailed from "./pages/paymentFailed";
import TermsAndConditions from "./pages/terms";


function App() {

    const{isAuthenticated, user, isLoading} = useSelector(state=> state.auth)
    const dispatch = useDispatch()

    useEffect(()=>{
        dispatch(checkAuth())
    }, [dispatch])

    if(isLoading) return <Skeleton className="w-[500px] h-[500px] rounded-full" />


    return (
        <div className="flex flex-col min-h-screen w-full overflow-hidden bg-white">
            <div>
            <Routes>
                {/* Auth Layout */}
                <Route path="/auth" element={
                    <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                        <AuthLayout /> 
                    </CheckAuth>
                }>
                    <Route path="login" element={<AuthLogin />} />
                    <Route path="register" element={<AuthRegister />} />
                </Route>

                {/* Admin Layout */}
                <Route path="/admin" element={
                    <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                        <AdminLayout />
                    </CheckAuth>
                }>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="user" element={<AdminUser />} />
                </Route>
                <Route path="/payment-success" element={<PaymentSuccess />} />  
                <Route path="/payment-failed" element={<PaymentFailed />} />  

                {/* Shopping Layout */}
                <Route path="/shop" element={
                    <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                        <ShoppingLayout />
                    </CheckAuth>
                }>
                    <Route path="home" element={<ShoppingHome />} />
                    <Route path="account" element={<ShoppingAccount />} />
                    <Route path="checkout" element={<ShoppingCheckout />} />
<Route path="listing" element={<ShoppingListing />} />
                    <Route path="uploads" element={<ShoppingUploads />} />
                    <Route path="about" element={<ShoppingAbout />} />
                </Route>

                {/* Unauthorized Page */}
                <Route path="/unauth-page" element={<UnauthPage />} />

                {/* No Page Found */}
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            </div>
        </div>
    );
}

export default App;
