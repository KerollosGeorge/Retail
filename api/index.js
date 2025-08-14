import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import session from "express-session";
import passport from "passport";
import "./utils/passport.js"; // Import passport configuration

// Import Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js";
import reviewRoutes from "./routes/review.js";
import categoryRoutes from "./routes/category.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/order.js";
import { errorHandler } from "./utils/error-handeler.js";

// Setup environment variables
dotenv.config();
const app = express();

// Check for required environment variables
if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in .env file");
  process.exit(1);
}

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "100mb" })); // for parsing application/json
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(helmet());
app.use(xss());

// Rate limiter
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 500, // Allow 500 requests per window per IP
    message: "Too many requests, please try again later.",
  })
);

// Session management
app.use(
  session({
    secret: process.env.SESSION_SECRET || "someSecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Retail Server");
});
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/review", reviewRoutes);

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8000;
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected.");
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start", error);
    process.exit(1);
  }
};

start();
