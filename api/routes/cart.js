import express from "express";
import {
  addToCart,
  clearCart,
  getCart,
  removeProductFromCart,
  updateProductQuantityInCart,
} from "../controllers/cart.js";
import { verifyToken, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getCart);
router.put("/add", verifyToken, addToCart);
router.put("/updateQuantity", verifyToken, updateProductQuantityInCart);
router.put("/remove", verifyToken, removeProductFromCart);
router.put("/clear", verifyToken, clearCart);

export default router;
