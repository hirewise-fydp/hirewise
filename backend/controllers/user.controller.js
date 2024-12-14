import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log("name : ",name)

  if ([name, email, password, role].some((field) => !field)) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, role, password: hashedPassword });

  res.status(201).json({
    message: "User registered successfully",
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, "Email and password are required"));
  }

  const user = await User.findOne({ email });
  console.log("user:", user);
  if (!user) {
    return next(new ApiError(401, "User not found"));
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(new ApiError(401, "Invalid credentials"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  res
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
    .json({
      message: "Login successful",
      user: { id: user._id, name: user.name, role: user.role },
    });
});


export { registerUser, loginUser };