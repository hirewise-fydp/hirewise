import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axios/AxiosInstance';

// Define initial state with localStorage support
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  loading: false,
  error: null,
};

// Base API URL (Use env variable for flexibility)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/user';

// Thunk to check authentication
export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/auth/check`, { withCredentials: true });
    localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user in localStorage
    return response.data.user;
  } catch (error) {
    localStorage.removeItem('user'); // Clear localStorage if auth fails
    return rejectWithValue(error.response?.data?.message || 'Authentication check failed.');
  }
});

// Thunk to handle login
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/login`, credentials, { withCredentials: true });
    localStorage.setItem('user', JSON.stringify(response.data.user)); 
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed.');
  }
});

export const register = createAsyncThunk('auth/register', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/register`, credentials, { withCredentials: true });
    localStorage.setItem('user', JSON.stringify(response.data.user)); 
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed.');
  }
});

// Thunk to handle logout
export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
    localStorage.removeItem('user'); 
    return null;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Logout failed.');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('user'); // Ensure localStorage is cleared
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
