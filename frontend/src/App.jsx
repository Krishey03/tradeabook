import { Route, Routes } from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminOrders from "./pages/admin-view/orders";
import AdminFeatures from "./pages/admin-view/features";
import AdminProducts from "./pages/admin-view/products";
import NotFound from "./pages/not-found";
import ShoppingLayout from "./pages/shopping-view/layout";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingAccount from "./pages/shopping-view/account";
import ShoppingCheckout from "./pages/shopping-view/checkout";
import ShoppingListing from "./pages/shopping-view/listing";
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./store/auth-slice";

function App() {
    // // Dummy data for testing
    // const isAuthenticated = false; // Set to `false` for testing unauthenticated behavior
    // const user = null

    const{isAuthenticated, user, isLoading} = useSelector(state=> state.auth)
    const dispatch = useDispatch()

    useEffect(()=>{
        dispatch(checkAuth())
    }, [dispatch])

    if(isLoading) return <div>Loading..</div>

    return (
        <div className="flex flex-col overflow-hidden bg-white">
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
                    <Route path="features" element={<AdminFeatures />} />
                </Route>

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
                </Route>

                {/* Unauthorized Page */}
                <Route path="/unauth-page" element={<UnauthPage />} />

                {/* No Page Found */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
}

export default App;
