import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { CreateError } from "../utils/customError.js";
import { sendMail } from "../utils/sendMail.js";

export const register = async (req, res, next) => {
  try {
    const { username, email, password, gender } = req.body;
    const user = await User.findOne({ email });
    if (user)
      return next(
        CreateError(StatusCodes.FORBIDDEN, "you already Signed Up before")
      );
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    // make confirmation mail
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      gender,
    });
    await newUser.save();
    res
      .status(StatusCodes.CREATED)
      .json({ message: "User created successfully" });
  } catch (error) {
    console.log("Error in signup controller");
    next(error);
  }
};

export const googleCallback = async (req, res, next) => {
  try {
    const email = req.user?.emails?.[0]?.value;
    const username = req.user?.displayName || "Unknown";

    if (!email) {
      return res.redirect(`${process.env.CLIENT_URL}/register?error=email`);
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.redirect(
        `${process.env.CLIENT_URL}/register?error=alreadyExists`
      );
    }

    const newUser = new User({
      username,
      email,
      gender: "",
      fromGoogle: true,
    });

    await newUser.save();

    return res.redirect(
      `${process.env.CLIENT_URL}/login?success=googleRegistered`
    );
  } catch (error) {
    console.error("Google callback error:", error);
    return res.redirect(`${process.env.CLIENT_URL}/register?error=server`);
  }
};

//Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not Found"));
    }

    // Verify password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return next(CreateError(StatusCodes.FORBIDDEN, "Incorrect Password"));
    }
    // Generate tokens
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Update user with the new refresh token
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { refreshToken },
      { new: true }
    );

    // Set cookies
    res
      .cookie("access_token", token, {
        httpOnly: true,
        sameSite: "Strict",
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      })
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        sameSite: "Strict",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      })
      .status(StatusCodes.OK)
      .json({
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          gender: updatedUser.gender,
          image: updatedUser.image,
          address: updatedUser.address,
          phone: updatedUser.phone,
          role: updatedUser.role,
          favourites: updatedUser.favourites,
        },
        message: "Login successful",
        token,
      });
  } catch (error) {
    console.error("Error in login controller:", error);
    next(error);
  }
};

// Refresh token
export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return next(
        CreateError(StatusCodes.UNAUTHORIZED, "No refresh token provided")
      );
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return next(
        CreateError(StatusCodes.UNAUTHORIZED, "Invalid refresh token")
      );
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, data) => {
      if (err || user.id !== data.id) {
        return next(
          CreateError(StatusCodes.UNAUTHORIZED, "Invalid refresh token")
        );
      }

      // Generate new tokens
      const newAccessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      const newRefreshToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      // Update user's refresh token in the database
      await User.findByIdAndUpdate(user.id, { refreshToken: newRefreshToken });

      // Set cookies with the new tokens
      res
        .cookie("access_token", newAccessToken, {
          httpOnly: true,
          sameSite: "Strict",
          secure: process.env.NODE_ENV === "production",
          expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        })
        .cookie("refresh_token", newRefreshToken, {
          httpOnly: true,
          sameSite: "Strict",
          secure: process.env.NODE_ENV === "production",
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        })
        .status(StatusCodes.OK)
        .json({
          message: "Token refreshed successfully",
          token: newAccessToken,
        });
    });
  } catch (error) {
    console.error("Error in refresh token controller:", error);
    next(error);
  }
};

/* export const refreshToken = async (req, res, next) => {
  try {
    const cookie = req.cookies;
    if (!cookie) {
      return next(CreateError(StatusCodes.UNAUTHORIZED, "No cookie provided"));
    }
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return next(
        CreateError(StatusCodes.UNAUTHORIZED, "No refresh token provided")
      );
    }
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return next(
        CreateError(StatusCodes.UNAUTHORIZED, "Invalid refresh token")
      );
    }
    // Verify refresh token
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, data) => {
      if (err || user.id !== data.id) {
        return next(
          CreateError(StatusCodes.UNAUTHORIZED, "Invalid refresh token")
        );
      }
      // Generate new access token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Set cookie
      res
        .cookie("access_token", token, {
          httpOnly: true,
          sameSite: "Strict",
          expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        })
        .status(StatusCodes.OK)
        .json({ message: "Token refreshed successfully", user });
    });
  } catch (error) {
    console.error("Error in refresh token controller:", error);
    next(error);
  }
}; */

// Forgot Password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(CreateError(StatusCodes.NOT_FOUND, "User not found"));
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "60s",
    });
    sendMail({ user, token })
      .then((info) => {
        res.status(StatusCodes.OK).json({ Status: "Success" });
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        next(
          CreateError(StatusCodes.INTERNAL_SERVER_ERROR, "Error sending email")
        );
      });
  } catch (error) {
    console.error("Error in forgot password controller:", error);
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    if (!id || !password || !token) {
      return res.status(400).send({
        Status: "Error",
        message: "User ID, token, and password are required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id !== id) {
      return res.status(401).send({
        Status: "Error with Token",
        message: "Token mismatch",
      });
    }

    if (password.length < 6) {
      return res.status(400).send({
        Status: "Error",
        message: "Password must be at least 6 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    res.status(200).send({
      Status: "Success",
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).send({
        Status: "Error with Token",
        message: "Token expired",
      });
    }

    res.status(500).send({
      Status: "Error",
      message: "Something went wrong",
    });
  }
};
/* export const resetPassword = async (req, res, next) => {
  try {
    const { id, token } = req.params; // User ID from route parameters
    const { password } = req.body; // Password from request body

    // Validate input
    if (!id || !password || !token) {
      return next(
        CreateError(
          StatusCodes.BAD_REQUEST,
          "User ID and password are required"
        )
      );
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      if (err) {
        return next(CreateError(StatusCodes.UNAUTHORIZED, "Invalid token"));
      } else {
        bcrypt
          .hash(req.body.password, 10)
          .then((hash) => {
            User.findByIdAndUpdate(
              { _id: id },
              { $set: { password: hash } },
              { new: true }
            )
              .then((user) => {
                res.send({ message: "Password reset successfully" });
              })
              .catch((err) => res.send({ message: err }));
          })
          .catch((err) => res.send({ message: err }));
      }
    });
  } catch (error) {
    console.error("Error in reset password controller:", error);
    next(error);
  }
}; */

// Logout
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return next(
        CreateError(StatusCodes.UNAUTHORIZED, "No refresh token provided")
      );
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return next(
        CreateError(StatusCodes.UNAUTHORIZED, "Invalid refresh token")
      );
    }

    // Remove refresh token from user
    await User.findByIdAndUpdate(user.id, { refreshToken: "" });

    // Clear cookies
    res
      .clearCookie("access_token", {
        httpOnly: true,
        sameSite: "Strict",
        secure: process.env.NODE_ENV === "production",
      })
      .clearCookie("refresh_token", {
        httpOnly: true,
        sameSite: "Strict",
        secure: process.env.NODE_ENV === "production",
      })
      .status(StatusCodes.OK)
      .json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller:", error);
    next(error);
  }
};

/* export const logout = async (req, res, next) => {
  try {
    const cookie = req.cookies;
    if (!cookie) {
      return next(CreateError(StatusCodes.UNAUTHORIZED, "No cookie provided"));
    }
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return next(
        CreateError(StatusCodes.UNAUTHORIZED, "No refresh token provided")
      );
    }
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return next(
        CreateError(StatusCodes.UNAUTHORIZED, "Invalid refresh token")
      );
    }
    // Remove refresh token from user
    await User.findByIdAndUpdate(user.id, { refreshToken: "" });
    // Clear cookies
    res
      .clearCookie("access_token")
      .clearCookie("refresh_token")
      .status(StatusCodes.OK)
      .json({ message: "Logged out successfully " });
  } catch (error) {
    console.error("Error in logout controller:", error);
    next(error);
  }
};
 */
