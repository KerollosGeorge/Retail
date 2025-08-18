// controllers/cartController.js
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";

// helper to compute total on a populated cart
function computeCartTotal(populatedCart) {
  let sum = 0;
  if (!populatedCart?.products) return 0;
  for (const item of populatedCart.products) {
    const prod = item.productId;
    if (prod) sum += prod.price * item.quantity;
  }
  return sum;
}

// Add to Cart (atomic stock decrement + upsert cart item)
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Product ID and positive quantity are required." });
    }

    // 1) Atomically decrement stock if enough available
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    );
    if (!updatedProduct) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Insufficient stock available." });
    }

    // 2) Add/increase item in cart (try increment existing, else push)
    let cart = await Cart.findOneAndUpdate(
      { userId, "products.productId": productId },
      { $inc: { "products.$.quantity": quantity } },
      { new: true }
    );

    if (!cart) {
      cart = await Cart.findOneAndUpdate(
        { userId },
        {
          $setOnInsert: { userId },
          $push: { products: { productId, quantity } },
        },
        { upsert: true, new: true }
      );
    }

    // 3) Return populated cart + total + updatedProduct
    const populatedCart = await Cart.findOne({ userId }).populate(
      "products.productId"
    );
    const total = computeCartTotal(populatedCart);

    return res.status(StatusCodes.OK).json({
      message: "Product added to cart.",
      cart: populatedCart,
      total,
      updatedProduct,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error." });
  }
};

// Update Product Quantity in Cart (atomic delta on stock)
export const updateProductQuantityInCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || quantity == null || quantity < 1) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid quantity or product ID." });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Cart not found." });

    const item = cart.products.find(
      (p) => p.productId.toString() === productId
    );
    if (!item)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Product not in cart." });

    const delta = quantity - item.quantity;
    let updatedProduct;

    if (delta > 0) {
      // need more units → try to decrement stock atomically
      updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: delta } },
        { $inc: { stock: -delta } },
        { new: true }
      );
      if (!updatedProduct) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Insufficient stock available." });
      }
    } else if (delta < 0) {
      // reducing quantity → restore stock
      updatedProduct = await Product.findOneAndUpdate(
        { _id: productId },
        { $inc: { stock: Math.abs(delta) } },
        { new: true }
      );
    } else {
      // no change
      updatedProduct = await Product.findById(productId);
    }

    // update item quantity in cart and save
    item.quantity = quantity;
    await cart.save();

    const populatedCart = await Cart.findOne({ userId }).populate(
      "products.productId"
    );
    const total = computeCartTotal(populatedCart);

    return res.status(StatusCodes.OK).json({
      message: "Quantity updated.",
      cart: populatedCart,
      total,
      updatedProduct,
    });
  } catch (error) {
    console.error("Update quantity error:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error." });
  }
};

// Remove Product from Cart (restore exact qty)
export const removeProductFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Product ID is required." });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Cart not found." });

    const idx = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );
    if (idx === -1) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Product not found in cart." });
    }

    const removedQty = cart.products[idx].quantity;

    // restore stock atomically
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId },
      { $inc: { stock: removedQty } },
      { new: true }
    );

    // remove item from cart
    cart.products.splice(idx, 1);
    await cart.save();

    const populatedCart = await Cart.findOne({ userId }).populate(
      "products.productId"
    );
    const total = computeCartTotal(populatedCart);

    return res.status(StatusCodes.OK).json({
      message: "Product removed from cart.",
      cart: populatedCart,
      total,
      updatedProduct,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error." });
  }
};

// Clear Cart (restore all stock + return restoredProducts)
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId });
    if (!cart)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Cart not found." });

    const restoredProducts = [];

    // restore stock for each item
    for (const item of cart.products) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId },
        { $inc: { stock: item.quantity } },
        { new: true }
      );
      if (updated) restoredProducts.push(updated);
    }

    // clear cart
    cart.products = [];
    await cart.save();

    const populatedCart = await Cart.findOne({ userId }).populate(
      "products.productId"
    );

    return res.status(StatusCodes.OK).json({
      message: "Cart cleared successfully.",
      cart: populatedCart, // empty populated structure
      total: 0,
      restoredProducts, // <<< frontend uses this to refresh stockMap
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error." });
  }
};

// Get Cart (always populated + total)
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found." });

    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "products.productId"
    );
    if (!cart)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Cart not found." });

    const total = computeCartTotal(cart);
    return res.status(StatusCodes.OK).json({ ...cart.toObject(), total });
  } catch (error) {
    console.error("Get cart error:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error." });
  }
};

/* import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import { CreateError } from "../utils/customError.js";

// Add Product to Cart (or create cart if none exists)
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    // Validate User
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }

    // Validate Product
    const product = await Product.findById(productId);
    if (!product) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Product not found"));
    }

    // Validate product stock
    if (quantity <= 0) {
      return next(CreateError(StatusCodes.BAD_REQUEST, "Invalid quantity"));
    } else if (quantity > product.stock) {
      return next(
        CreateError(StatusCodes.BAD_REQUEST, "Quantity exceeds stock")
      );
    }

    // Get or Create Cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, products: [], total: 0 });
    }

    // Check if Product Already Exists in Cart
    const existingItem = cart.products.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity; // ✅ Increase existing quantity
    } else {
      cart.products.push({ productId, quantity });
    }

    // Recalculate Cart Total
    let total = 0;
    for (const item of cart.products) {
      const product = await Product.findById(item.productId);
      total += product.price * item.quantity;
    }
    cart.total = total;

    // Save and Respond
    await cart.save();
    res.status(StatusCodes.OK).json(cart);
  } catch (error) {
    console.error("Error in addProductToCart:", error);
    next(error);
  }
};

// Update Product Quantity in Cart
export const updateProductQuantityInCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    // Validate User
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }
    // Validate Product
    const product = await Product.findById(productId);
    if (!product) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Product not found"));
    }

    // Validate Quantity
    if (quantity <= 0) {
      return next(CreateError(StatusCodes.BAD_REQUEST, "Invalid quantity"));
    } else if (quantity > product.stock) {
      return next(
        CreateError(StatusCodes.BAD_REQUEST, "Quantity exceeds stock")
      );
    } else {
      // Get Cart
      let cart = await Cart.findOne({ userId: req.user.id });
      if (!cart) {
        return next(CreateError(StatusCodes.NOT_FOUND, "Cart not found"));
      }
      // Update Product Quantity
      const index = cart.products.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (index !== -1) {
        cart.products[index].quantity = quantity;
      } else {
        return next(
          CreateError(StatusCodes.NOT_FOUND, "Product not found in cart")
        );
      }
      // Recalculate Cart Total
      let total = 0;
      for (const item of cart.products) {
        const product = await Product.findById(item.productId);
        total += product.price * item.quantity;
      }
      cart.total = total;
      // Save and Respond
      await cart.save();
      res.status(StatusCodes.OK).json(cart);
    }
  } catch (error) {
    console.error("Error in updateProductQuantityInCart:", error);
    next(error);
  }
};

// Remove Product from Cart
export const removeProductFromCart = async (req, res, next) => {
  try {
    const { productId } = req.body;

    // Validate User
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }
    // Validate Product
    const product = await Product.findById(productId);
    if (!product) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Product not found"));
    }
    // Get Cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Cart not found"));
    }
    if (
      cart.products.findIndex(
        (item) => item.productId.toString() === productId
      ) === -1
    ) {
      return next(
        CreateError(StatusCodes.NOT_FOUND, "Product not found in cart")
      );
    }
    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );
    // Recalculate Cart Total
    let total = 0;
    for (const item of cart.products) {
      const product = await Product.findById(item.productId);
      total += product.price * item.quantity;
    }
    cart.total = total;
    // Save and Respond
    await cart.save();
    res.status(StatusCodes.OK).json(cart);
  } catch (error) {
    console.error("Error in removeProductFromCart:", error);
    next(error);
  }
};

// clear cart
export const clearCart = async (req, res, next) => {
  try {
    // Validate User
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }
    // Get Cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Cart not found"));
    }
    // Clear Cart
    cart.products = [];
    cart.total = 0;
    // Save and Respond
    await cart.save();
    res.status(StatusCodes.OK).json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Error in clearCart:", error);
    next(error);
  }
};

// Get Cart
export const getCart = async (req, res, next) => {
  try {
    // Validate User
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }
    // Get Cart
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "products.productId"
    );
    if (!cart) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Cart not found"));
    }
    res.status(StatusCodes.OK).json(cart);
  } catch (error) {
    console.error("Error in getCart:", error);
    next(error);
  }
};
 */
