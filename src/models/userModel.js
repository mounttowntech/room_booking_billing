const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // ============================================================
    // BASIC USER DETAILS
    // ============================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobileNumber: {
      type: String,
      required: false,
      trim: true,
    },

    // ============================================================
    // PASSWORD
    // ============================================================

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    // ============================================================
    // ROLE
    // ============================================================

    role: {
      type: String,
      required: true,
      enum: [
        "admin",
        "manager",
        "receptionist",
        "housekeeping",
        "accountant",
      ],
      default: "receptionist",
    },

    // ============================================================
    // ACCOUNT STATUS
    // ============================================================

    isActive: {
      type: Boolean,
      default: true,
    },

    // ============================================================
    // FIRST LOGIN EMAIL
    // ============================================================

    loginMailSentAt: {
      type: Date,
      default: null,
    },

    // ============================================================
    // LAST LOGIN
    // ============================================================

    lastLoginAt: {
      type: Date,
      default: null,
    },

    // ============================================================
    // PASSWORD CHANGE TRACKING
    // ============================================================

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    // ============================================================
    // FORGOT PASSWORD OTP
    // ============================================================

    resetPasswordOTP: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordOTPExpire: {
      type: Date,
      default: null,
      select: false,
    },

    resetPasswordOTPVerified: {
      type: Boolean,
      default: false,
      select: false,
    },

    resetPasswordOTPAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    // ============================================================
    // AUDIT
    // ============================================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// HASH PASSWORD BEFORE SAVE
// ============================================================

userSchema.pre("save", async function () {
  try {
    // Password is not changed
    if (!this.isModified("password")) {
      return ;
    }

    // Generate salt
    const salt = await bcrypt.genSalt(12);

    // Hash password
    this.password = await bcrypt.hash(
      this.password,
      salt
    );

 
  } catch (error) {
    return (error);
  }
});

// ============================================================
// COMPARE PASSWORD
// ============================================================

userSchema.methods.comparePassword = async function (
  enteredPassword
) {
  return bcrypt.compare(
    enteredPassword,
    this.password
  );
};

// ============================================================
// EXPORT MODEL
// ============================================================

module.exports =
  mongoose.models.UserModel ||
  mongoose.model("UserModel", userSchema);