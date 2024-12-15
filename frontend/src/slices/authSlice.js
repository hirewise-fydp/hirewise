import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axios/AxiosInstance';

// Define initial state
const initialState = {
  user: null,
  loading: false,
  error: null,
};

// Thunk to check authentication
export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('http://localhost:5000/api/user/auth/check', {
      withCredentials: true, 
    });
    return response.data.user; 
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Authentication check failed.');
  }
});

// Thunk to handle login
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('http://localhost:5000/api/user/login', credentials, {
      withCredentials: true,
    });
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed.');
  }
});

// Thunk to handle registration
export const register = createAsyncThunk('auth/register', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('http://localhost:5000/api/user/register', credentials, {
      withCredentials: true,
    });
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed.');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
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
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
