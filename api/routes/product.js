import express from "express";
import {
  addDiscount,
  createProduct,
  deleteProduct,
  deleteProductImage,
  getAllProducts,
  getBlockedProducts,
  getDiscountedProducts,
  getPrivateProducts,
  getProduct,
  getProductsByCategory,
  getRelatedProducts,
  getTopRatedProducts,
  getTopSellingProducts,
  getUnBlockedProducts,
  searchProducts,
  updateProduct,
} from "../controllers/product.js";
import { verifyStaff, verifyToken } from "../utils/verifyToken.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Staff Role
router.post("/", verifyStaff, upload.array("images"), createProduct);
router.put("/:id", verifyStaff, updateProduct);
router.put("/discount/:id", verifyStaff, addDiscount);
router.put("/:productId/:imageId", verifyStaff, deleteProductImage);
router.delete("/:id", verifyStaff, deleteProduct);
router.get("/blocked", verifyStaff, getBlockedProducts);

// All Roles
router.get("/", getUnBlockedProducts);
router.get("/related/:id", getRelatedProducts);
router.get("/discounts", getDiscountedProducts);
router.get("/topRated", getTopRatedProducts);
router.get("/topSelling", getTopSellingProducts);
router.get("/private", getPrivateProducts);
router.get("/:id", getProduct);
router.get("/search/", searchProducts);
router.get("/category/:id", getProductsByCategory);

export default router;
