import mongoose from "mongoose";
const Schema = mongoose.Schema;
import dotenv from 'dotenv';
import jwt from "jsonwebtoken"

dotenv.config(); 

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['HR', 'Admin'], required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  refreshToken: {
      type: String
  }
});


userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
      {
          _id: this._id,
          email: this.email,
          name: this.name,
          role: this.role
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
  )
}
userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
      {
          _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY
      }
  )
}
export const User = mongoose.model('User', userSchema);

