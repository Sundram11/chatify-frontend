import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    status: false,
    accessToken: null,
    refreshToken: null
};

const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        authLogin: (state, action) => {
            state.status = true;
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
        },
        authLogout: (state) => {
            state.status = false;
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
        }
    }
})

export const {authLogin, authLogout} = authSlice.actions;
export default authSlice.reducer;