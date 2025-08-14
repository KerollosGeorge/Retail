import express from "express";
import passport from "passport";
import { googleCallback } from "../controllers/auth.js";
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Ensure this path is correct
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Normal authentication
router.post("/register", register);
router.post("/login", login);
router.post("/forgetPassword", forgotPassword);
router.post("/resetPassword/:id/:token", resetPassword);
router.get("/refreshToken", refreshToken);
router.get("/logout", logout);

// Redirect user to Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Handle Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/register?error=unauthorized`,
  }),
  googleCallback
);

export default router;
