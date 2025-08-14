import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import { CreateError } from "../utils/customError.js";

export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.stock < 1) {
      return res.status(400).json({ message: "Product is out of stock." });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    const itemIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.products[itemIndex].quantity += 1;
    } else {
      cart.products.push({ productId, quantity: 1 });
    }

    product.stock -= 1;
    await product.save();
    await cart.save();

    const updatedProduct = await Product.findById(productId);
    const populatedCart = await Cart.findOne({ userId }).populate(
      "products.productId"
    );

    const total = await populatedCart.products.reduce(
      async (accPromise, item) => {
        const acc = await accPromise;
        const prod = item.productId;
        return acc + (prod ? prod.price * item.quantity : 0);
      },
      Promise.resolve(0)
    );

    res.status(200).json({
      message: "Product added to cart",
      cart: populatedCart,
      total: await total,
      updatedProduct,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update Product Quantity in Cart
export const updateProductQuantityInCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || quantity == null || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Invalid quantity or product ID." });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const itemInCart = cart.products.find(
      (item) => item.productId.toString() === productId
    );
    if (!itemInCart)
      return res.status(404).json({ message: "Product not in cart" });

    const quantityChange = quantity - itemInCart.quantity;

    if (quantityChange > 0 && product.stock < quantityChange) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }

    itemInCart.quantity = quantity;
    product.stock -= quantityChange;

    await product.save();
    await cart.save();

    // ✅ Populate productId after saving the cart
    const populatedCart = await Cart.findOne({ userId }).populate(
      "products.productId"
    );

    const total = await populatedCart.products.reduce(
      async (accPromise, item) => {
        const acc = await accPromise;
        const prod = item.productId;
        return acc + (prod ? prod.price * item.quantity : 0);
      },
      Promise.resolve(0)
    );

    res.status(200).json({
      message: "Quantity updated",
      cart: populatedCart, // ✅ send populated cart
      total: await total,
      updatedProduct: await Product.findById(productId), // still return updated product for Zustand
    });
  } catch (error) {
    console.error("Update quantity error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove Product from Cart
export const removeProductFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const itemIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart." });
    }

    const removedQuantity = cart.products[itemIndex].quantity;
    product.stock += removedQuantity;

    cart.products.splice(itemIndex, 1);

    await product.save();
    await cart.save();

    const updatedProduct = await Product.findById(productId);
    const populatedCart = await Cart.findOne({ userId }).populate(
      "products.productId"
    );

    const total = await populatedCart.products.reduce(
      async (accPromise, item) => {
        const acc = await accPromise;
        const prod = item.productId;
        return acc + (prod ? prod.price * item.quantity : 0);
      },
      Promise.resolve(0)
    );

    res.status(200).json({
      message: "Product removed from cart",
      cart: populatedCart,
      total: await total,
      updatedProduct,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Clear Cart
export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // Restore product stock for each item
    for (const item of cart.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // Clear all items from the cart
    cart.products = [];
    await cart.save();

    // Return updated, empty cart with populated structure
    const populatedCart = await Cart.findOne({ userId }).populate(
      "products.productId"
    );

    res.status(200).json({
      message: "Cart cleared successfully.",
      cart: populatedCart,
      total: 0,
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get Cart
export const getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));

    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "products.productId"
    );
    if (!cart)
      return next(CreateError(StatusCodes.NOT_FOUND, "Cart not found"));

    res.status(StatusCodes.OK).json(cart);
  } catch (error) {
    next(error);
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
