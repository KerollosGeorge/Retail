import express from "express";
import {
  addOrRemoveProductToFavorites,
  blockOrUnblockUser,
  deleteUser,
  getAllUsers,
  getFavoriteProducts,
  getUser,
  getUserCarts,
  getUserOrders,
  getUsersCount,
  updateRole,
  updateUser,
} from "../controllers/user.js";
import { verifyAdmin, verifyToken, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();
// Admin Role
router.delete("/:id", verifyAdmin, deleteUser);
router.get("/", verifyAdmin, getAllUsers);
router.put("/updateRole/:id", verifyAdmin, updateRole);
router.put("/blockUser/:id", verifyAdmin, blockOrUnblockUser);
router.get("/usersCount", verifyAdmin, getUsersCount);

// User Role
//only user can update his own data
router.put("/:id", /*verifyUser,*/ updateUser);
router.put(
  "/favoriteProducts/:userId",
  // verifyUser,
  addOrRemoveProductToFavorites
);

router.get("/:id", verifyToken, getUser);
router.get("/favoriteProducts/:userId", getFavoriteProducts);
// router.get("ordersHistory/:userId", verifyToken, getUserOrders)
// router.get("/carts/:userId", verifyToken,getUserCarts)

export default router;
