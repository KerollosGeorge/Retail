import { StatusCodes } from "http-status-codes";

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong, please try again later";

  if (err.name === "ValidationError") {
    statusCode = StatusCodes.BAD_REQUEST;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }
  if (err.name === "CastError") {
    statusCode = StatusCodes.NOT_FOUND;
    message = "Resource not found";
  }
  if (err.name === "JsonWebTokenError") {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = "Invalid token. Please login again";
  }
  if (err.name === "UnauthorizedError") {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = "Unauthorized access. Please authenticate";
  }
  if (err.code && err.code === 11000) {
    statusCode = StatusCodes.CONFLICT;
    message = `Duplicate value enterd for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
  }
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    stack: err.stack,
    // stack: process.env.NODE_ENV === "development"? err.stack : null
  });
};
