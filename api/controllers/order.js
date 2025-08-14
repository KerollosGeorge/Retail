import Order from "../models/Order.js";
import User from "../models/User.js";
import Cart from "../models/Cart.js";
import { StatusCodes } from "http-status-codes";
import { CreateError } from "../utils/customError.js";

//Place order
/* export const placeOrder = async (req, res, next) => {
  try {
    const { cartId, deliveryAddress, paymentMethod } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Cart not found"));
    }
    if (cart.products.length === 0) {
      return next(CreateError(StatusCodes.BAD_REQUEST, "Cart is empty"));
    }
    const order = await Order.create({
      user: user._id,
      cart: cart._id,
      deliveryAddress,
      paymentMethod,
      total: cart.total,
      ...req.body,
    });
    await order.save();
    await Cart.findByIdAndUpdate(cartId, { products: [] });
    res.status(StatusCodes.CREATED).json(order);
  } catch (error) {
    console.error("Error in placeOrder controller:", error);
    next(error);
  }
}; */

export const placeOrder = async (req, res, next) => {
  try {
    const { cartId, deliveryAddress, paymentMethod } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }

    const cart = await Cart.findById(cartId).populate("products.productId"); // Populate product details
    if (!cart) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Cart not found"));
    }

    if (cart.products.length === 0) {
      return next(CreateError(StatusCodes.BAD_REQUEST, "Cart is empty"));
    }

    // Extract full product details
    const cartProducts = cart.products.map((item) => ({
      productId: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      quantity: item.quantity,
      image: item.productId.image, // Ensure the product model has an "image" field
    }));

    // Create an order with full product details
    const order = await Order.create({
      user: user._id,
      cart: cart._id,
      cartProducts, // Save detailed product info
      deliveryAddress,
      paymentMethod,
      total: cart.total,
    });

    await order.save();
    await Cart.findByIdAndUpdate(cartId, { products: [] }); // Empty the cart

    res.status(StatusCodes.CREATED).json(order);
  } catch (error) {
    console.error("Error in placeOrder controller:", error);
    next(error);
  }
};

/* // Get all orders for a user
export const getUserOrders = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }
    const orders = await Order.find({ user: user._id }).populate("cart");
    res.status(StatusCodes.OK).json(orders);
  } catch (error) {
    console.error("Error in getUserOrders controller:", error);
    next(error);
  }
};

// Get order by ID
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Order not found"));
    }
    res.status(StatusCodes.OK).json(order);
  } catch (error) {
    console.error("Error in getOrderById controller:", error);
    next(error);
  }
}; */

export const getUserOrders = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }

    const orders = await Order.find({ user: user._id }).populate("user");

    res.status(StatusCodes.OK).json(orders);
  } catch (error) {
    console.error("Error in getUserOrders controller:", error);
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user");
    if (!order) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Order not found"));
    }

    res.status(StatusCodes.OK).json(order);
  } catch (error) {
    console.error("Error in getOrderById controller:", error);
    next(error);
  }
};

// Update order status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!order) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Order not found"));
    }
    res.status(StatusCodes.OK).json(order);
  } catch (error) {
    console.error("Error in updateOrderStatus controller:", error);
    next(error);
  }
};

// Delete order
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Order not found"));
    }
    if (
      order &&
      order.user.toString() === req.user.id.toString() &&
      order.status === "pending"
    ) {
      await Cart.findByIdAndUpdate(order.cart, { products: [] }); // Remove all products from the cart after deleting the order
      await order.deleteOne(); // Delete the order from the database
      return res.status(StatusCodes.OK).json({
        message: "Order deleted successfully",
      });
    }
    return next(
      CreateError(
        StatusCodes.FORBIDDEN,
        "You can only delete your own pending orders"
      )
    );
  } catch (error) {
    console.error("Error in deleteOrder controller:", error);
    next(error);
  }
};
