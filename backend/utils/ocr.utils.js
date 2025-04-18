import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { ApiError } from './ApiError.js';

export const extractTextFromFile = async (fileUrl, localFilePath = null) => {
  try {
    let response;

    if (fileUrl && fileUrl.includes('cloudinary')) {
      // Send the URL in a JSON payload
      response = await axios.post(
        'http://127.0.0.1:5001/extract-text',
        { image_url: fileUrl },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000, // Increased timeout to 30 seconds
        }
      );
    } else if (localFilePath) {
      // Handle local file upload using form-data
      const formData = new FormData();
      formData.append('image', fs.createReadStream(localFilePath));

      response = await axios.post('http://127.0.0.1:5001/extract-text', formData, {
        headers: formData.getHeaders(),
        timeout: 30000, // Increased timeout to 30 seconds
      });
    } else {
      throw new ApiError(400, 'Invalid file source');
    }

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