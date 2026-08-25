const mongoose = require("mongoose");

const housekeepingSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },

        taskType: {
            type: String,
            enum: [
                "regular_cleaning",
                "checkout_cleaning",
                "deep_cleaning",
                "maintenance",
                "inspection"
            ],
            default: "regular_cleaning",
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        status: {
            type: String,
            enum: [
                "pending",
                "in_progress",
                "completed",
                "cancelled",
            ],
            default: "pending",
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },

        startedAt: Date,

        completedAt: Date,

        notes: {
            type: String,
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
    }
);

module.exports = mongoose.models.Housekeeping || mongoose.model("Housekeeping", housekeepingSchema);
