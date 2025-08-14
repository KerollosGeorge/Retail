import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    barcode: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    brand: { type: String, default: "", required: true }, //add negma to be brand used at private products
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    category: { type: String, required: true },

    quantity: { type: Number, required: true },
    inventory: { type: Number, required: true, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    sold: { type: Number, required: true, default: 0 },
    Available: { type: Boolean, required: true, default: true },

    unitPrice: { type: Number, required: true },
    VAT: { type: Number, enum: [0, 14], required: true, default: 0 },
    price: { type: Number, required: true },
    discount: { type: Number },
    discountedPrice: { type: Number },
    discountStartDate: { type: Date },
    discountEndDate: { type: Date },

    rating: { type: Number, required: true },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }], // relationship with Review model
    numReviews: { type: Number, required: true, default: 0 },

    unitOfMeasure: {
      type: String,
      enum: ["kg", "pcs"],
      required: true,
      default: "pcs",
    },
    weight: { type: Number },

    color: { type: String },
    isBlocked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
