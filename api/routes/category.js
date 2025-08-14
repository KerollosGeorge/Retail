import express from "express";
import { verifyStaff, verifyToken } from "../utils/verifyToken.js";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  updateCategory,
} from "../controllers/category.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

router.get("/", /*  verifyToken, */ getAllCategories);
router.get("/:id", /*  verifyToken, */ getCategory);

// Admin Role
router.post("/", verifyStaff, upload.single("image"), addCategory);
router.put("/:id", verifyStaff, updateCategory);
router.delete("/:id", verifyStaff, deleteCategory);

export default router;
