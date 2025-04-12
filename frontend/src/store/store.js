import { configureStore } from "@reduxjs/toolkit"
import authReducer from './auth-slice'
import adminProductsSlice from './admin/products-slice'
import shopProductsSlice from './shop/products-slice'
import userReducer from "../store/admin/user-slice/index"


const store = configureStore({
    reducer: {
        auth:authReducer,
        adminProducts: adminProductsSlice,
        shopProductsSlice: shopProductsSlice,
        users: userReducer,
    }  
})

export default store