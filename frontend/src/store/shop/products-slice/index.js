import {createSlice} from '@reduxjs/toolkit'
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/api/axios';



const initialState={
    isLoading: false,
    productList: [],
    productDetails: null
}

export const fetchAllUserProducts = createAsyncThunk('/products/fetchAllProducts', 
    async ()=>{
        const result = await api.get('/shop/products/get')
        return result?.data
    }

)

export const fetchProductDetails = createAsyncThunk('/products/fetchProductDetails', 
    async (id)=>{
        const result = await api.get(`/shop/products/get/${id}`)
        return result?.data
    }

)

const shoppingProductSlice = createSlice({
    name: 'shoppingProduct',
    initialState,
    reducers: {
        setProductDetails: (state) => {
            state.productDetails = null;
          },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAllUserProducts.pending,(state)=>{
            state.isLoading = true
        }).addCase(fetchAllUserProducts.fulfilled,(state,action)=>{
            console.log(action.payload.data)
            state.isLoading = false,
            state.productList = action.payload.data
        }).addCase(fetchAllUserProducts.rejected,(state,action)=>{
            state.isLoading = false,
            state.productList = []
        }).addCase(fetchProductDetails.pending,(state)=>{
            state.isLoading = true
        }).addCase(fetchProductDetails.fulfilled,(state,action)=>{
            console.log(action.payload.data)
            state.isLoading = false,
            state.productDetails = action.payload.data
        }).addCase(fetchProductDetails.rejected,(state,action)=>{
            state.isLoading = false,
            state.productList = null
        })
    }
})
export const { setProductDetails } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;