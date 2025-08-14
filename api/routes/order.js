import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import {
  deleteOrder,
  getOrderById,
  getUserOrders,
  placeOrder,
  updateOrderStatus,
} from "../controllers/order.js";

const router = express.Router();

router.get("/", verifyToken, getUserOrders);
router.get("/:id", verifyToken, getOrderById);
router.post("/", verifyToken, placeOrder);
router.put("/:id", verifyToken, updateOrderStatus);
router.delete("/:id", verifyToken, deleteOrder);

export default router;
