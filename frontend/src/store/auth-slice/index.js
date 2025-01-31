import {createSlice} from '@reduxjs/toolkit'
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from "axios";



const initialState = {
    isAuthenticated: false,
    isLoading: false,
    user: null,
}

// export const registerUser = createAsyncThunk('/auth/register', 
//     async(formData)=>{
//        const response = await axios.post('http://localhost:3000/api/auth/register', formData,
//         {
//             withCredentials: true
//         }
//         )
//         return response.data 
//     }
// )

export const registerUser = createAsyncThunk('/auth/register', 
    async (formData, { rejectWithValue }) => {
        try {
            console.log("Sending FormData:", formData); // Debugging

            const response = await axios.post('http://localhost:3000/api/auth/register', formData, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            return response.data;
        } catch (error) {
            console.error("Registration Error:", error.response?.data);
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
)

const authSlice = createSlice({
    name : 'auth',
    initialState,
    reducers: {
        setUser:(state,action)=> {},
    },
    extraReducers: (builder)=> {
        builder.addCase(registerUser.pending, (state)=>{
            state.isLoading = true
        }).addCase(registerUser.fulfilled, (state)=>{
            state.isLoading = false
            state.isAuthenticated = false
            state.user = null
        }).addCase(registerUser.rejected, (state)=>{
            state.isLoading = false
            state.isAuthenticated = false
            state.user = null
        })
    }
})

export const {setUser} = authSlice.actions
export default authSlice.reducer