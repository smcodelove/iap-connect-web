// src/store/slices/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    loading: false,
    error: null
  },
  reducers: {}
});

export default userSlice.reducer;