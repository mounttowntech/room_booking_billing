const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,

      required: true,

      trim: true,

      unique: true,
    },

    roomType: {
      type: String,

      required: true,

      enum: ["single", "double", "twin", "deluxe", "suite", "family"],

      default: "single",
    },
    floor: {
      type: String,

      trim: true,
    },

    capacity: {
      type: Number,
      default: 2,
    },

    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },

    amenities: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: [
        "available",
        "reserved",
        "occupied",
        "maintenance",
        "cleaning",
        "blocked",
      ],
      default: "available",
    },

    description: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Room", roomSchema);
