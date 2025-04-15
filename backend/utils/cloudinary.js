import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const uploadToCloudinary = async (localFilePath, options = {}) => {
  if (!localFilePath) return null;

  const fileName = path.basename(localFilePath);
  const publicId = `${options.folder || 'uploads'}/${Date.now()}_${fileName}`;

  const uploadWithRetry = async (attempt = 1) => {
    try {
      const response = await cloudinary.uploader.upload(localFilePath, {
        public_id: publicId,
        resource_type: 'auto',
        timeout: 30000,
        ...options,
      });

      await safeCleanup(localFilePath);
      return {
        url: response.secure_url,
        publicId: response.public_id,
        assetId: response.asset_id,
        format: response.format,
        bytes: response.bytes,
      };
    } catch (error) {
      if (attempt >= MAX_RETRIES) {
        console.error(`Upload failed after ${MAX_RETRIES} attempts:`, error);
        await safeCleanup(localFilePath);
        throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
      }

      console.warn(`Upload attempt ${attempt} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * attempt));
      return uploadWithRetry(attempt + 1);
    }
  };

  return uploadWithRetry();
};

export const safeCleanup = async (filePath) => {
  try {
    if (await fs.access(filePath).then(() => true).catch(() => false)) {
      await fs.unlink(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Failed to clean up file ${filePath}:`, error);
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted asset from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error(`Failed to delete from Cloudinary: ${publicId}`, error);
  }
};