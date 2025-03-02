import {createSlice} from '@reduxjs/toolkit'
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';



const initialState={
    isLoading: false,
    productList: [],
}

export const fetchAllUserProducts = createAsyncThunk('/products/fetchAllProducts', 
    async ()=>{
        const result = await axios.get('http://localhost:5000/api/shop/products/get')
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
        })
    }
})
export const { setProductDetails } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;