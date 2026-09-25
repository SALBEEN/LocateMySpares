// product schema to hold the product data and validate it

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    damageFund: {
      type: Number,
      required: true,
    },
    stock: {
      // renter can add the stock of the product not to rent but to show
      type: Number,
      required: true,
      default: 1,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

productSchema.pre("save", function (next) {
  // if (this.stock <= 0) {
  //   this.isAvailable = false;
  // } else {
  //   this.isAvailable = true;
  // }
  // next();
  this.isAvailable = this.stock > 0;
});

const Product = mongoose.model("Product", productSchema);

export default Product;
