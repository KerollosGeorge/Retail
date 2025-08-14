import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import { CreateError } from "../utils/customError.js";

//Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(StatusCodes.OK).json(users);
  } catch (error) {
    console.log("Error in get all users controller");
    next(error);
  }
};

//Get a user
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }
    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    console.log("Error in get user controller");
    next(error);
  }
};

//Update a user
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }
    res
      .status(StatusCodes.OK)
      .json({ message: "Your Informations are Updated Successfully", user });
  } catch (error) {
    if (error.code === 11000) {
      return next(CreateError(StatusCodes.BAD_REQUEST, "Email already exists"));
    }
    console.log("Error in update user controller");
    next(error);
  }
};

// Only admin can update only the role of a user
// but the admin can't update his role
export const updateRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }
    if (user.role === "admin") {
      return next(
        CreateError(StatusCodes.BAD_REQUEST, "You can't update your role")
      );
    }
    user.role = req.body.role;
    await user.save();
    res
      .status(StatusCodes.OK)
      .json({ message: "User Role is Updated Successfully", user });
  } catch (error) {
    console.log("Error in update role controller");
    next(error);
  }
};
//Delete a user
// delete user with associated orders and products and reviews and comments and favorites and cart items
// admin can't delete his account
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }
    if (user.role === "admin") {
      return next(
        CreateError(StatusCodes.BAD_REQUEST, "You can't delete your account")
      );
    }
    const carts = await Cart.find({ user: req.params.id });
    const reviews = await Review.find({ user: req.params.id });
    const orders = await Order.find({ user: req.params.id });
    if (carts.length > 0 || reviews.length > 0 || orders.length > 0) {
      return next(
        CreateError(
          StatusCodes.BAD_REQUEST,
          "User is associated with carts or reviews or orders, cannot be deleted"
        )
      );
    }
    await user.deleteOne();
    res
      .status(StatusCodes.OK)
      .json({ message: "the Account is Deleted Successfully" });
  } catch (error) {
    console.log("Error in delete user controller");
    next(error);
  }
};

// block or unblock a user
export const blockOrUnblockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }
    if (user.role === "admin") {
      return next(
        CreateError(
          StatusCodes.BAD_REQUEST,
          "You can't block or unblock your account"
        )
      );
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    if (user.isBlocked) {
      return res
        .status(StatusCodes.OK)
        .json({ message: "User is Unblocked Successfully", user });
    }
    res
      .status(StatusCodes.OK)
      .json({ message: "User is Blocked Successfully", user });
  } catch (error) {
    console.log("Error in block or unblock user controller");
    next(error);
  }
};

// Get user's favorites
export const getFavoriteProducts = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).populate("favorites"); // Fixed userId param
    if (!user) {
      return res.status(StatusCodes.OK).json([]); // Return empty array if user not found
    }
    res.status(StatusCodes.OK).json(user.favorites); // Corrected response field
  } catch (error) {
    next(error);
  }
};

// add or remove user's favorites
export const addOrRemoveProductToFavorites = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }

    const productIndex = user.favorites.findIndex(
      (fav) => fav.toString() === productId
    );

    if (productIndex !== -1) {
      user.favorites.splice(productIndex, 1); // Remove favorite
    } else {
      user.favorites.push(productId); // Add favorite
    }

    await user.save();

    res.status(StatusCodes.OK).json({
      message: "Favorites updated successfully",
      favorites: user.favorites,
    });
  } catch (error) {
    console.log("Error in add or remove favorite controller", error);
    next(error);
  }
};

// Get Users Counts
export const getUsersCount = async (req, res, next) => {
  try {
    const usersCount = await User.countDocuments({ role: "user" });
    const adminCount = await User.countDocuments({ role: "admin" });
    const staffCount = await User.countDocuments({ role: "staff" });
    res
      .status(StatusCodes.OK)
      .json({ Users: usersCount, Admins: adminCount, Staff: staffCount });
  } catch (error) {
    console.log("Error in get users count controller");
    next(error);
  }
};

//Get user's orders
export const getUserOrders = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).populate("orders");
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }
    res.status(StatusCodes.OK).json(user.orders);
  } catch (error) {
    console.log("Error in get user's orders controller");
    next(error);
  }
};

// Get user's cart
export const getUserCarts = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).populate("cart");
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }
    const carts = await Cart.find({ user: req.params.id }).populate("product");
    res.status(StatusCodes.OK).json(carts);
  } catch (error) {
    console.log("Error in get user's cart controller");
    next(error);
  }
};
