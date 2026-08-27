const Housekeeping = require("../models/housekeepingModel");
const Room = require("../models/roomModel");
const bookingService = require(
  "../services/bookingService"
);
const Booking = require("../models/bookingModel");

// ============================================================
// CREATE BOOKING
// ============================================================

exports.createBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await bookingService.createBooking({
        ...req.body,

        createdBy:
          req.user?._id,
      });

    res.status(201).json({
      success: true,

      message:
        "Booking created successfully",

      data: booking,
    });
  } catch (error) {
    console.error(
      "Create Booking Error:",
      error
    );

    res.status(400).json({
      success: false,

      message:
        error.message,
    });
  }
};

// ============================================================
// UPDATE BOOKING
// ============================================================

exports.updateBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await bookingService.updateBooking({
        bookingId:
          req.params.id,

        data:
          req.body,

        updatedBy:
          req.user?._id,
      });

    res.json({
      success: true,

      message:
        "Booking updated successfully",

      data: booking,
    });
  } catch (error) {
    console.log(
      "Update Booking Error:",
      error
    );
    res.status(400).json({
      success: false,

      message:
        error.message,
    });
  }
};



// ============================================================
// GET BOOKINGS
// ============================================================

exports.getBookings = async (
  req,
  res
) => {
  try {
    const bookings =
      await bookingService.getBookings({
        status:
          req.query.status,

        search:
          req.query.search,
      });

    res.json({
      success: true,

      count:
        bookings.length,

      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message:
        error.message,
    });
  }
};

// ============================================================
// GET BOOKING
// ============================================================

exports.getBookingById = async (
  req,
  res
) => {
  try {
    const booking =
      await bookingService.getBookingById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,

        message:
          "Booking not found",
      });
    }

    res.json({
      success: true,

      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message:
        error.message,
    });
  }
};

// ============================================================
// CHECK IN
// ============================================================

exports.checkIn = async (
  req,
  res
) => {
  try {
    const booking =
      await bookingService.checkInBooking({
        bookingId:
          req.params.id,

        updatedBy:
          req.user?._id,
      });

    res.json({
      success: true,

      message:
        "Guest checked in successfully",

      data: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,

      message:
        error.message,
    });
  }
};

// ============================================================
// CHECK OUT
// ============================================================

// exports.checkOut = async ( req, res) => {
//   try {
//     const booking =
//       await bookingService.checkOutBooking({
//         bookingId:
//           req.params.id,

//         updatedBy:
//           req.user?._id,
//       });

//     res.json({
//       success: true,

//       message:
//         "Guest checked out successfully",

//       data: booking,
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,

//       message:
//         error.message,
//     });
//   }
// };
exports.checkOut  = async (req, res) => {
  try {
    const { id } = req.params;

    // ==========================================================
    // FIND BOOKING
    // ==========================================================

    const booking = await Booking.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ==========================================================
    // CHECK CURRENT STATUS
    // ==========================================================

    if (booking.bookingStatus !== "checked_in") {
      return res.status(400).json({
        success: false,
        message:
          "Only checked-in bookings can be checked out",
      });
    }

    // ==========================================================
    // UPDATE BOOKING
    // ==========================================================

    booking.bookingStatus = "checked_out";
    booking.updatedBy = req.user?._id;

    await booking.save();

    // ==========================================================
    // UPDATE ROOM STATUS
    // ==========================================================

    await Room.findByIdAndUpdate(
      booking.roomId,
      {
        status: "cleaning",
      }
    );

    // Check existing housekeeping task
const existingTask =
  await Housekeeping.findOne({
    roomId: booking.roomId,
    taskType: "checkout_cleaning",
    status: {
      $in: [
        "pending",
        "in_progress",
      ],
    },
  });


// Create only if no active task exists
let housekeepingTask = existingTask;

if (!existingTask) {
  housekeepingTask =
    await Housekeeping.create({
      roomId: booking.roomId,

      taskType: "checkout_cleaning",

      status: "pending",

      priority: "medium",

      notes: `Checkout cleaning for booking ${booking.bookingNo}`,

      createdBy: req.user?._id,
    });
}

    // ==========================================================
    // RESPONSE
    // ==========================================================

     res.json({
      success: true,

      message:
        "Guest checked out and housekeeping task created successfully",

      data: {
        booking,
        housekeepingTask,
      },
    });

  } catch (error) {
    console.error(
      "Checkout error:",
      error
    );

     res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// CANCEL
// ============================================================

exports.cancelBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await bookingService.cancelBooking({
        bookingId:
          req.params.id,

        reason:
          req.body.reason,

        updatedBy:
          req.user?._id,
      });

    res.json({
      success: true,

      message:
        "Booking cancelled successfully",

      data: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,

      message:
        error.message,
    });
  }
};


// ============================================================
// GET BOOKING PAYMENT SUMMARY
// ============================================================

exports.getBookingPaymentSummary = async (req, res) => {
  try {
    console.log("Fetching booking payment summary...");
    const summary =
      await bookingService.getBookingPaymentSummary();
console.log("Booking Payment Summary:", summary);

    res.json({
      success: true,
      count: summary.length,
      data: summary,
    });
  } catch (error) {
    console.log(
      "Get Booking Payment Summary Error:",
      error
    );
    console.error(
      "Get Booking Payment Summary Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};