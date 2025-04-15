import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { ApiError } from './ApiError.js';

export const extractTextFromFile = async (fileUrl, localFilePath = null) => {
  try {
    const formData = new FormData();

    if (fileUrl && fileUrl.includes('cloudinary')) {
      formData.append('url', fileUrl);
    } else if (localFilePath) {
      formData.append('image', fs.createReadStream(localFilePath));
    } else {
      throw new ApiError(400, 'Invalid file source');
    }

    const response = await axios.post('http://127.0.0.1:5001/extract-text', formData, {
      headers: formData.getHeaders(),
      timeout: 10000,
    });

    if (!response.data || !response.data.text) {
      throw new ApiError(500, 'OCR failed to extract text from the file.');
    }

    return response.data.text;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new ApiError(500, 'OCR server is not running. Please start the Flask server.');
    }
    throw new ApiError(error.response?.status || 500, error.response?.data?.error || 'Failed to process OCR');
  }
};