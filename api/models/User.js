import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return !this.fromGoogle; // only require password for non-Google users
    },
  },
  gender: { type: String, required: true },
  image: { type: String, default: "" },
  address: { type: String, default: "" },
  phone: { type: String, default: "" },
  role: { type: String, enum: ["user", "staff", "admin"], default: "user" },
  isBlocked: { type: Boolean, default: false },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // Correct type
  fromGoogle: { type: Boolean, default: false },
  refreshToken: { type: String, default: "" },
});

export default mongoose.model("User", UserSchema);
