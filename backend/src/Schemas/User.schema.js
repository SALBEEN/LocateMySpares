// user schema to hold user data and validate it

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["renter", "lender"], required: true },
    lenderAddress: { type: String },
    storeAddress: { type: String },

    // Email Verification Flags & OTP Storage
    isEmailVerified: { type: Boolean, default: false },
    emailOtp: { type: String },
    emailOtpExpiresAt: { type: Date },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
