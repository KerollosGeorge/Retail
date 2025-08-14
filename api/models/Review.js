import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    type: { type: String,enum:['site', 'product'] ,required: true },    
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product"},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
},{ timestamps: true });

export default mongoose.model("Review", reviewSchema);