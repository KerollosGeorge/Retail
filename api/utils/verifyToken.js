import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { CreateError } from "./customError.js";
import User from "../models/User.js"; // Ensure the correct path to your User model

export const verifyToken = async (req, res, next) => {
  try {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (!accessToken) {
      if (!refreshToken) {
        return next(CreateError(StatusCodes.UNAUTHORIZED, "No token provided"));
      }

      // Verify refresh token
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        // Find user by refresh token
        const user = await User.findOne({ refreshToken });
        if (!user || user.id !== decoded.id) {
          return next(
            CreateError(StatusCodes.UNAUTHORIZED, "Invalid refresh token")
          );
        }

        // Generate new access token
        const newAccessToken = jwt.sign(
          { id: user.id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        // Set the new access token in the response cookie
        res.cookie("access_token", newAccessToken, {
          httpOnly: true,
          sameSite: "Strict",
          expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        });

        req.user = { id: user.id, role: user.role };
        return next();
      } catch (err) {
        return next(
          CreateError(StatusCodes.UNAUTHORIZED, "Invalid refresh token")
        );
      }
    } else {
      // Verify access token
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
      } catch (err) {
        return next(
          CreateError(StatusCodes.UNAUTHORIZED, "Invalid access token")
        );
      }
    }
  } catch (error) {
    console.error("Error in verifyToken middleware:", error);
    next(error);
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    await verifyToken(req, res, async (err) => {
      if (err) return next(err);
      // console.log(req.user.id, req.params.userId);
      if (req.user.id == req.params.userId) {
        return next();
      }
      return next(
        CreateError(
          StatusCodes.FORBIDDEN,
          "You are not authorized to access this resource"
        )
      );
    });
  } catch (error) {
    console.error("Error in verifyUser middleware:", error);
    next(error);
  }
};

// Verify Staff
export const verifyStaff = async (req, res, next) => {
  try {
    await verifyToken(req, res, async (err) => {
      if (err) return next(err);
      if (req.user.role == "staff" || req.user.role == "admin") {
        return next();
      }
      return next(
        CreateError(
          StatusCodes.FORBIDDEN,
          "You are not authorized to access this resource"
        )
      );
    });
  } catch (error) {
    console.error("Error in verifyStaff middleware:", error);
    next(error);
  }
};

// Verify Admin
export const verifyAdmin = async (req, res, next) => {
  try {
    await verifyToken(req, res, async (err) => {
      if (err) return next(err);
      if (req.user.role == "admin") {
        return next();
      }
      return next(
        CreateError(
          StatusCodes.FORBIDDEN,
          "You are not authorized to access this resource"
        )
      );
    });
  } catch (error) {
    console.error("Error in verifyAdmin middleware:", error);
    next(error);
  }
};
