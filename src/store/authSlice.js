import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: false,
  userData: null,
  userRole: null,
  permissions: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload.userData;
      state.userRole = action.payload.userRole || 'user';
      state.permissions = action.payload.permissions || [];
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
      state.userRole = null;
      state.permissions = [];
    },
    updateUserRole: (state, action) => {
      state.userRole = action.payload.role;
      state.permissions = action.payload.permissions || [];
    },
  },
});

export const { login, logout, updateUserRole } = authSlice.actions;
export default authSlice.reducer;
