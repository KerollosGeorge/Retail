import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables

// Cloudinary configuration
cloudinary.config({
  cloud_name: process?.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a file to Cloudinary
export const uploadImage = async (buffer) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      {
        folder: "Retail",
        allowed_formats: ["jpg", "png", "gif"],
        transformation: [{ width: 500, height: 500, crop: "scale" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({ public_id: result.public_id, url: result.secure_url });
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};
/* export const uploadImage = async (image) => {
  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: "Retail",
      allowed_formats: ["jpg", "png", "gif"],
      transformation: [{ width: 500, height: 500, crop: "scale" }],
    });

    return { public_id: result.public_id, url: result.secure_url };
  } catch (error) {
    throw new Error(error.message);
  }
}; */

export const uploadImageFromURL = async (imageUrl) => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "Retail",
      allowed_formats: ["jpg", "png", "gif"],
      transformation: [{ width: 500, height: 500, crop: "scale" }],
    });

    return { public_id: result.public_id, url: result.secure_url };
  } catch (error) {
    throw new Error("Failed to upload image from URL: " + error.message);
  }
};

// Delete a file from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok") {
      throw new Error("Failed to delete image from Cloudinary");
    }

    return { success: true, message: "Image deleted successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};
