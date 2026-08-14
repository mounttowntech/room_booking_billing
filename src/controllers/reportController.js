const Booking = require("../models/bookingModel");
const Payment = require("../models/payemntModel");

/**
 * ============================================================
 * REVENUE REPORT
 * ============================================================
 *
 * GET /api/reports/revenue
 *
 * Query:
 * ?startDate=2026-08-01&endDate=2026-08-14
 *
 */
exports.revenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // ---------------------------------------------------------
    // Date range
    // ---------------------------------------------------------

    let start;
    let end;

    if (startDate) {
      start = new Date(startDate);
    } else {
      // First day of current month
      const now = new Date();

      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
    }

    if (endDate) {
      end = new Date(endDate);
    } else {
      end = new Date();
    }

    // Start of day
    start.setHours(0, 0, 0, 0);

    // End of day
    end.setHours(23, 59, 59, 999);

    // ---------------------------------------------------------
    // Validate dates
    // ---------------------------------------------------------

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate",
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate cannot be greater than endDate",
      });
    }

    // ---------------------------------------------------------
    // Payment aggregation
    // ---------------------------------------------------------

    const payments = await Payment.aggregate([
      {
        $match: {
          isDeleted: false,

          status: "success",

          paymentDate: {
            $gte: start,
            $lte: end,
          },
        },
      },

      {
        $group: {
          _id: "$paymentMethod",

          total: {
            $sum: "$amount",
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          total: -1,
        },
      },
    ]);

    // ---------------------------------------------------------
    // Total revenue
    // ---------------------------------------------------------

    const totalRevenue = payments.reduce(
      (sum, item) => sum + item.total,
      0
    );

    // ---------------------------------------------------------
    // Total payment count
    // ---------------------------------------------------------

    const totalPayments = payments.reduce(
      (sum, item) => sum + item.count,
      0
    );

    // ---------------------------------------------------------
    // Response
    // ---------------------------------------------------------

    res.status(200).json({
      success: true,

      data: {
        startDate: start,
        endDate: end,

        totalRevenue,

        totalPayments,

        paymentMethods: payments,
      },
    });
  } catch (error) {
    console.error(
      "Revenue Report Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * ============================================================
 * BOOKING REPORT
 * ============================================================
 *
 * GET /api/reports/bookings
 *
 * Query:
 * ?startDate=2026-08-01&endDate=2026-08-14
 *
 */
exports.bookingReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // ---------------------------------------------------------
    // Date range
    // ---------------------------------------------------------

    let start;
    let end;

    if (startDate) {
      start = new Date(startDate);
    } else {
      const now = new Date();

      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
    }

    if (endDate) {
      end = new Date(endDate);
    } else {
      end = new Date();
    }

    start.setHours(0, 0, 0, 0);

    end.setHours(23, 59, 59, 999);

    // ---------------------------------------------------------
    // Validate dates
    // ---------------------------------------------------------

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate",
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate cannot be greater than endDate",
      });
    }

    // ---------------------------------------------------------
    // Booking aggregation
    // ---------------------------------------------------------

    const report = await Booking.aggregate([
      {
        $match: {
          isDeleted: false,

          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },

      {
        $group: {
          _id: "$bookingStatus",

          count: {
            $sum: 1,
          },

          amount: {
            $sum: {
              $ifNull: ["$totalAmount", 0],
            },
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]);

    // ---------------------------------------------------------
    // Total bookings
    // ---------------------------------------------------------

    const totalBookings = report.reduce(
      (sum, item) => sum + item.count,
      0
    );

    // ---------------------------------------------------------
    // Total booking amount
    // ---------------------------------------------------------

    const totalAmount = report.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    // ---------------------------------------------------------
    // Response
    // ---------------------------------------------------------

    res.status(200).json({
      success: true,

      data: {
        startDate: start,
        endDate: end,

        totalBookings,

        totalAmount,

        bookingsByStatus: report,
      },
    });
  } catch (error) {
    console.error(
      "Booking Report Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};