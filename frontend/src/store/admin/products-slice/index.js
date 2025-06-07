import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '@/api/axios'


const initialState={
    isLoading: false,
    productList: []
}

export const addNewProduct = createAsyncThunk('/admin/products/addnewproduct', 
    async (formData)=>{
        const result = await api.post('/admin/products/add', formData, {
            headers: {
                'Content-Type' : 'application/json'
            }
        })

        return result?.data
    }

)

export const fetchAllProducts = createAsyncThunk('/admin/products/fetchAllProducts', 
    async ()=>{
        const result = await api.get('/admin/products/get')
        return result?.data
    }

)

export const editProduct = createAsyncThunk('/admin/products/editProduct', 
    async ({id, formData})=>{
        const result = await api.put(`/admin/products/edit/${id}`, formData, {
            headers: {
                'Content-Type' : 'application/json'
            }
        })

        return result?.data
    }

)

export const deleteProduct = createAsyncThunk('/admin/products/deleteProduct', 
    async (id)=>{
        const result = await api.delete(`/admin/products/delete/${id}`)

        return result?.data
    }

)

const AdminProductsSlice = createSlice({
    name: 'adminProducts',
    initialState,
    reducers:{},
    extraReducers: (builder)=>{
        builder.addCase(fetchAllProducts.pending, (state)=>{
            state.isLoading = true
        }).addCase(fetchAllProducts.fulfilled, (state, action)=>{
            console.log(action.payload.data)
            state.isLoading = false
            state.productList = action.payload.data
        }).addCase(fetchAllProducts.rejected, (state, action)=>{
            console.log()
            state.isLoading = false
            state.productList = []
        })
    }
})

export default AdminProductsSlice.reducer