import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rentalStartDate: { type: Date, required: true },
    rentalEndDate: { type: Date, required: true },

    // NEW: Split the costs so the math is bulletproof
    rentalCost: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    totalCost: { type: Number, required: true }, // Just rentalCost + securityDeposit combined

    status: {
      type: String,
      required: true,
      enum: [
        "Pending",
        "Active",
        "Return Pending",
        "Damage Claimed", // Lender reported damage
        "Disputed", // Renter disagreed with damage
        "Completed", // Safe return
        "Completed (Damaged)", // Renter accepted fault
        "Cancelled",
      ],
      default: "Pending",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Completed", "Refund Owed", "Rejected"],
      default: "Pending",
    },
    paymentRejectionNote: { type: String, default: "" },
    paymentProofImage: { type: String, default: null },

    actualReturnDate: { type: Date, default: null },

    damageFundStatus: {
      type: String,
      enum: ["Held", "Refunded", "Claimed", "Disputed"],
      default: "Held",
    },
    damageReportNote: { type: String, default: "" }, // NEW: Store lender's damage complaint
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
