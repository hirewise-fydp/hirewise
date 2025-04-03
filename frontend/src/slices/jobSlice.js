import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axios/AxiosInstance';

// Define initial state
const initialState = {
  jobId: null,
  loading: false,
  error: null,
};

export const processJobDescription = createAsyncThunk(
  'job/processJobDescription',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        'http://localhost:5000/api/v4/hr/process-jd',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      console.log("RESPONSE IS>>>>>>>>", response);
      
      return response.data.jobId ; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process job description.');
    }
  }
);

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    resetJobState: (state) => {
      state.jobId = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processJobDescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processJobDescription.fulfilled, (state, action) => {
        state.loading = false;
        state.jobId = action.payload; // Save the jobId in the state
      })
      .addCase(processJobDescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetJobState } = jobSlice.actions;

export default jobSlice.reducer;
