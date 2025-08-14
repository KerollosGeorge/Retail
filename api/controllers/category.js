import Category from "../models/Category.js";
import {
  uploadImage,
  uploadImageFromURL,
  deleteImage,
} from "../utils/cloudinary.js";
import { StatusCodes } from "http-status-codes";
import { CreateError } from "../utils/customError.js";
import multer from "multer";

const storage = multer.memoryStorage();
const uploadCategory = multer({ storage });

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(StatusCodes.OK).json(categories);
  } catch (error) {
    console.log("Error in get all categories controller");
    next(error);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Category not found"));
    }
    res.status(StatusCodes.OK).json(category);
  } catch (error) {
    console.log("Error in get category controller");
    next(error);
  }
};

export const addCategory = async (req, res, next) => {
  try {
    let uploadedImage = null;

    // Upload from internal storage (file)
    if (req.file) {
      uploadedImage = await uploadImage(req.file.buffer);
    }

    // Upload from direct URL
    else if (req.body.image) {
      uploadedImage = await uploadImageFromURL(req.body.image);
    }

    // No image provided
    else {
      return next(CreateError(StatusCodes.BAD_REQUEST, "Image is required"));
    }

    // Create category with uploaded image
    const category = await Category.create({
      ...req.body,
      image: uploadedImage, // { public_id, url }
    });

    res.status(StatusCodes.CREATED).json(category);
  } catch (error) {
    console.error("Error in create category controller", error);
    next(error);
  }
};
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!category) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Category not found"));
    }
    res
      .status(StatusCodes.OK)
      .json({ message: "Category updated successfully", category });
  } catch (error) {
    console.log("Error in update category controller");
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Category not found"));
    } else if (category?.products?.length > 0) {
      return next(
        CreateError(
          StatusCodes.BAD_REQUEST,
          "Category is associated with products, cannot be deleted"
        )
      );
    }
    await category.deleteOne();
    res
      .status(StatusCodes.OK)
      .json({ message: "Category deleted successfully" });
  } catch (error) {
    console.log("Error in delete category controller");
    next(error);
  }
};
