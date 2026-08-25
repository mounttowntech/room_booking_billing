const bookingService = require(
  "../services/bookingService"
);

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

exports.checkOut = async (
  req,
  res
) => {
  try {
    const booking =
      await bookingService.checkOutBooking({
        bookingId:
          req.params.id,

        updatedBy:
          req.user?._id,
      });

    res.json({
      success: true,

      message:
        "Guest checked out successfully",

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