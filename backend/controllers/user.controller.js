import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
dotenv.config(); 

const generateAccessAndRefreshTokens = async(userId)=>{
  console.log(userId);
  try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken 
      await user.save({validateBeforeSave: false})

      return {accessToken, refreshToken}
      
  } catch (error) {
      throw new ApiError(500, "Something went wrong while generating Access and Refresh Token")
  }
}


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

  console.log("REQ", email, password);
  

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
  console.log(accessToken, refreshToken);

  console.log("COOKIES", req.cookies);
  
  

  res
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
    .json({
      message: "Login successful",
      user: { id: user._id, name: user.name, role: user.role },
    });
});

const checkAuth = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return res.status(200).json({ user: decoded });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


export { registerUser, loginUser, checkAuth };