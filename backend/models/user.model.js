import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['HR', 'Admin'], required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
export const User = mongoose.model('User', userSchema);

