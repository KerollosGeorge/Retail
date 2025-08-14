import Product from "../models/Product.js";
import { StatusCodes } from "http-status-codes";
import { CreateError } from "../utils/customError.js";
import Review from "../models/Review.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import {
  uploadImage,
  uploadImageFromURL,
  deleteImage,
} from "../utils/cloudinary.js";

// Get All Products (including blocked)
export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(StatusCodes.OK).json(products);
  } catch (error) {
    console.log("Error in get all products controller");
    next(error);
  }
};

// Get All Products (excluding blocked)
export const getUnBlockedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isBlocked: false });
    res.status(StatusCodes.OK).json(products);
  } catch (error) {
    console.log("Error in get products controller");
    next(error);
  }
};

// Get Blocked Products
export const getBlockedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isBlocked: true });
    res.status(StatusCodes.OK).json(products);
  } catch (error) {
    console.log("Error in get blocked products controller");
    next(error);
  }
};

// Get Product By ID (with reviews)
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Product not found"));
    }
    res.status(StatusCodes.OK).json(product);
  } catch (error) {
    console.log("Error in get product controller");
    next(error);
  }
};

// Create a Product
export const createProduct = async (req, res, next) => {
  try {
    const { category: categoryName, imageUrls } = req.body;

    if (!categoryName) {
      return next(CreateError(StatusCodes.BAD_REQUEST, "Category is required"));
    }

    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return next(CreateError(StatusCodes.BAD_REQUEST, "Category not found"));
    }

    const imagesArray = [];

    // Upload images from internal storage
    if (req.files && req.files.length > 0) {
      const uploadedFromFiles = await Promise.all(
        req.files.map(async (file) => {
          const { public_id, url } = await uploadImage(file.buffer);
          return { public_id, url };
        })
      );
      imagesArray.push(...uploadedFromFiles);
    }

    // Upload images from direct URLs
    if (imageUrls) {
      const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
      const uploadedFromUrls = await Promise.all(
        urls.map(async (url) => {
          const { public_id, url: secureUrl } = await uploadImageFromURL(url);
          return { public_id, url: secureUrl };
        })
      );
      imagesArray.push(...uploadedFromUrls);
    }

    if (imagesArray.length === 0) {
      return next(
        CreateError(StatusCodes.BAD_REQUEST, "At least one image is required")
      );
    }

    req.body.images = imagesArray;

    // Create and save product
    const product = await Product.create(req.body);
    category.products.push(product._id);
    await category.save();

    res.status(StatusCodes.CREATED).json(product);
  } catch (error) {
    console.error("Error in createProduct:", error);
    next(error);
  }
};

/* export const createProduct = async (req, res, next) => {
  try {
    if (!req.body.category) {
      return next(CreateError(StatusCodes.BAD_REQUEST, "Invalid category"));
    }

    const category = await Category.findOne({ name: req.body.category });
    if (!category) {
      return next(CreateError(StatusCodes.BAD_REQUEST, "Category not found"));
    }

    // Ensure images are uploaded
    if (!req.files || req.files.length === 0) {
      return next(CreateError(StatusCodes.BAD_REQUEST, "No images uploaded"));
    }

    // Upload images to Cloudinary
    const imagesArray = await Promise.all(
      req.files.map(async (file) => {
        const { public_id, url } = await uploadImage(file.buffer);
        return { public_id, url };
      })
    );

    req.body.images = imagesArray;

    // Create and save product
    const product = await Product.create(req.body);
    category.products.push(product._id);
    await category.save();

    res.status(StatusCodes.CREATED).json(product);
  } catch (error) {
    console.error("Error in createProduct:", error);
    next(error);
  }
}; */

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }); // new: true returns the updated product
    if (!product) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Product not found"));
    }
    res.status(StatusCodes.OK).json(product);
  } catch (error) {
    console.log("Error in update product controller");
    next(error);
  }
};

// Delete a specific image from a product
export const deleteProductImage = async (req, res, next) => {
  try {
    const { productId, imageId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Product not found"));
    }

    const imageIndex = product.images.findIndex(
      (img) => img._id.toString() === imageId
    );
    if (imageIndex === -1) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Image not found"));
    }

    const publicId = product.images[imageIndex].public_id;
    await deleteImage(publicId);

    product.images.splice(imageIndex, 1);
    await product.save();

    res.status(StatusCodes.OK).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProductImage:", error);
    next(error);
  }
};

/* export const deleteProductImage = async (req, res, next) => {
  try {
    const { productId, imageId } = req.params; // Search using image._id

    // 1️⃣ Validate the Product
    const product = await Product.findById(productId);
    if (!product) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Product not found"));
    }

    // 2️⃣ Find the Image by `_id` in the Product's Images Array
    const imageIndex = product.images.findIndex(
      (img) => img._id.toString() === imageId
    );
    if (imageIndex === -1) {
      return next(
        CreateError(StatusCodes.NOT_FOUND, "Image not found in product")
      );
    }

    // 3️⃣ Get `public_id` from the Image Object
    const publicId = product.images[imageIndex].public_id;

    // 4️⃣ Delete Image from Cloudinary
    try {
      await deleteImage(publicId);
    } catch (error) {
      console.error(`Failed to delete image ${publicId}:`, error.message);
      return next(
        CreateError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Failed to delete image from Cloudinary"
        )
      );
    }

    // 5️⃣ Remove Image from Product Array
    product.images.splice(imageIndex, 1);
    await product.save();

    // 6️⃣ Send Success Response
    return res
      .status(StatusCodes.OK)
      .json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProductImage:", error);
    next(error);
  }
};
 */
// Delete Product
export const deleteProduct = async (req, res, next) => {
  try {
    // 1️⃣ Find the Product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Product not found"));
    }

    // 2️⃣ Delete All Associated Reviews
    await Review.deleteMany({ product: req.params.id });

    // 3️⃣ Remove Product from Orders
    await Order.updateMany(
      { "products.product": req.params.id },
      { $pull: { products: { product: req.params.id } } }
    );

    // 4️⃣ Remove Product from Categories
    await Category.updateMany(
      { products: req.params.id },
      { $pull: { products: req.params.id } }
    );

    // 5️⃣ Remove Product from Carts
    await Cart.updateMany(
      { "products.productId": req.params.id },
      { $pull: { products: { productId: req.params.id } } }
    );

    // 6️⃣ Delete Product Images from Cloudinary (with Error Handling)
    const images = Array.isArray(product.images)
      ? product.images.map((image) => image.public_id)
      : [];
    await Promise.all(
      images.map(async (publicId) => {
        try {
          await deleteImage(publicId);
        } catch (error) {
          console.error(`Failed to delete image ${publicId}:`, error.message);
        }
      })
    );

    // 7️⃣ Delete the Product Itself
    await product.deleteOne();

    // 8️⃣ Send Success Response
    return res
      .status(StatusCodes.OK)
      .json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    next(error);
  }
};

// BLock or unblock a product
export const blockOrUnblockProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Product not found"));
    }
    product.isBlocked = !product.isBlocked;
    await product.save();
    if (product.isBlocked) {
      return res
        .status(StatusCodes.OK)
        .json({ message: "Product is Unblocked Successfully", product });
    }
    res
      .status(StatusCodes.OK)
      .json({ message: "Product is Blocked Successfully", product });
  } catch (error) {
    console.log("Error in block or unblock product controller");
    next(error);
  }
};

// Get related products
export const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Product not found"));
    }
    const products = await Product.find({
      category: product.category,
      _id: { $ne: product.id },
    });
    res.status(StatusCodes.OK).json(products);
  } catch (error) {
    console.log("Error in get related products controller");
    next(error);
  }
};

// Search for products by name or category
export const searchProducts = async (req, res, next) => {
  try {
    const { name, decription, category, price, stock } = req.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: name, $options: "i" } },
        { decription: { $regex: decription, $options: "i" } },
        { category: { $regex: category, $options: "i" } },
        { price: { $regex: price, $options: "i" } },
        { stock: { $regex: stock, $options: "i" } },
      ],
    });
    res.status(StatusCodes.OK).json(products);
  } catch (error) {
    console.log("Error in search products controller");
    next(error);
  }
};

// Get product by category
export const getProductsByCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Category not found"));
    }
    // Fetch products in the category
    const products = await Product.find({ category: category.name });

    // Filter out blocked products
    const unblockedProducts = products.filter((product) => !product.isBlocked);

    // Sort products by createdAt date in descending order
    unblockedProducts.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    // Return the sorted products
    res.status(StatusCodes.OK).json(unblockedProducts);
  } catch (error) {
    console.log("Error in get products by category controller");
    next(error);
  }
};

// add discount
export const addDiscount = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Product not found"));
    }

    const discount = req.body.discount;
    if (!discount || discount < 0 || discount > 100) {
      return next(
        CreateError(StatusCodes.BAD_REQUEST, "Invalid discount percentage")
      );
    }

    const discountedPrice = product.price - (product.price * discount) / 100;

    product.discount = discount;
    product.discountedPrice = discountedPrice;
    product.discountStartDate = req.body.StartDate;
    product.discountEndDate = req.body.EndDate;

    await product.save();

    res
      .status(StatusCodes.OK)
      .json({ message: "Discount applied successfully", product });
  } catch (error) {
    console.log("Error in add discount controller");
    next(error);
  }
};

/* export const addDiscount = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id);
    if (!product) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Product not found"));
    }
    await product.updateOne({
      $set: {
        discount: req.body.discount,
        discountedPrice:
          product.price - (product.price * req.body.discount) / 100,
        discountStartDate: req.body.StartDate,
        discountEndDate: req.body.EndDate,
      },
    });

    res
      .status(StatusCodes.OK)
      .json({ message: "Discount updated successfully", product });
  } catch (error) {
    console.log("Error in add discount controller");
    next(error);
  }
}; */

export const getDiscountedProducts = async (req, res, next) => {
  try {
    // Remove expired discounts in bulk
    await Product.updateMany(
      { discountEndDate: { $lt: new Date() } },
      {
        $set: {
          discountStartDate: null,
          discountEndDate: null,
          discount: null,
          discountedPrice: null,
        },
      }
    );

    // Fetch products that have a valid discount and are in stock
    const products = await Product.find({
      discount: { $gt: 0 },
      stock: { $gt: 0 },
    });

    if (products.length === 0) {
      return res.status(200).json({ message: "No discounted products found." });
    }

    // Calculate discounted price for each product
    const discountedProducts = products.map((product) => {
      return {
        ...product.toObject(),
        discountedPrice:
          product.price - (product.price * product.discount) / 100,
      };
    });

    res.status(200).json(discountedProducts || []);
  } catch (error) {
    console.error("Error in getDiscountedProducts controller:", error);
    next(error);
  }
};

/* export const getDiscountedProducts = async (req, res, next) => {
  try {
    // Fetch products that have a discount greater than 0
    const products = await Product.find({
      discount: { $gt: 0 },
      stock: { $gt: 0 },
    });

    if (products.length > 0) {
      const discountedProducts = products.forEach((product) => {
        if (new Date() > new Date(product?.discountEndDate)) {
          product.discountStartDate = null;
          product.discountEndDate = null;
          product.discount = null;
          product.discountedPrice = null;
          product.save();
        }
        // Calculate the discounted price
        product.discountedPrice =
          product.price - (product.price * product.discount) / 100;

        return product;
      });
      // Return the full product objects, not just discount prices
      res.status(StatusCodes.OK).json(discountedProducts);
    }
  } catch (error) {
    console.log("Error in get discounted products controller:", error);
    next(error);
  }
}; */

// get top rated products
export const getTopRatedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      isBlocked: false,
      // $or: [{ discount: 0 }, { discount: { $exists: false } }],
      rating: { $exists: true },
    })
      .sort({ rating: -1, createdAt: -1 })
      .limit(20);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error in getTopRatedProducts controller:", error);
    next(error);
  }
};

// get top selling products
export const getTopSellingProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isBlocked: false })
      .sort({ sold: -1 })
      .limit(20);

    if (products.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error in getTopSellingProducts controller:", error);
    next(error);
  }
};

// get private products using brand
export const getPrivateProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ brand: "negma", isBlocked: false });
    res.status(StatusCodes.OK).json(products);
  } catch (error) {
    console.log("Error in get private products controller");
    next(error);
  }
};
