import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deliveryAddress: { type: String },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
    cartProducts: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        quantity: Number,
        image: String, // Store image URL if available
      },
    ],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    shippingFee: { type: Number },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "card", "paypal"],
      default: "cash",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
