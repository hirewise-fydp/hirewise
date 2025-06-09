import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    console.log("No token provided in request");
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      console.log("User not found for token:", decoded._id);
      throw new ApiError(401, "Invalid token: User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message, error.name);
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid access token");
    }
    throw new ApiError(401, "Unauthorized: Token verification failed");
  }
});