const Room = require("../models/roomModel");
const Booking = require("../models/bookingModel");
const Payment=require("../models/payemntModel")

// ============================================================
// GET DASHBOARD
// ============================================================

exports.getDashboard = async () => {
  // ----------------------------------------------------------
  // TODAY START
  // ----------------------------------------------------------

  const startOfDay =
    new Date();

  startOfDay.setHours(
    0,
    0,
    0,
    0
  );

  // ----------------------------------------------------------
  // TODAY END
  // ----------------------------------------------------------

  const endOfDay =
    new Date();

  endOfDay.setHours(
    23,
    59,
    59,
    999
  );

  // ----------------------------------------------------------
  // PARALLEL DATABASE QUERIES
  // ----------------------------------------------------------

  const [
    totalRooms,

    availableRooms,

    reservedRooms,

    occupiedRooms,

    cleaningRooms,

    maintenanceRooms,

    activeBookings,

    todayRevenue,

    pendingDue,

    recentBookings,

    occupancy,
  ] = await Promise.all([
    // --------------------------------------------------------
    // TOTAL ROOMS
    // --------------------------------------------------------

    Room.countDocuments({
      isDeleted: false,

      isActive: true,
    }),

    // --------------------------------------------------------
    // AVAILABLE ROOMS
    // --------------------------------------------------------

    Room.countDocuments({
      isDeleted: false,

      isActive: true,

      status: "available",
    }),

    // --------------------------------------------------------
    // RESERVED
    // --------------------------------------------------------

    Room.countDocuments({
      isDeleted: false,

      isActive: true,

      status: "reserved",
    }),

    // --------------------------------------------------------
    // OCCUPIED
    // --------------------------------------------------------

    Room.countDocuments({
      isDeleted: false,

      isActive: true,

      status: "occupied",
    }),

    // --------------------------------------------------------
    // CLEANING
    // --------------------------------------------------------

    Room.countDocuments({
      isDeleted: false,

      isActive: true,

      status: "cleaning",
    }),

    // --------------------------------------------------------
    // MAINTENANCE
    // --------------------------------------------------------

    Room.countDocuments({
      isDeleted: false,

      isActive: true,

      status: "maintenance",
    }),

    // --------------------------------------------------------
    // ACTIVE BOOKINGS
    // --------------------------------------------------------

    Booking.countDocuments({
      isDeleted: false,

      bookingStatus: {
        $in: [
          "confirmed",
          "checked_in",
        ],
      },
    }),

    // --------------------------------------------------------
    // TODAY REVENUE
    // --------------------------------------------------------

    Payment.aggregate([
      {
        $match: {
          isDeleted: false,

          status: "success",

          paymentDate: {
            $gte: startOfDay,

            $lte: endOfDay,
          },
        },
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: "$amount",
          },

          count: {
            $sum: 1,
          },
        },
      },
    ]),

    // --------------------------------------------------------
    // PENDING DUE
    // --------------------------------------------------------

    Booking.aggregate([
      {
        $match: {
          isDeleted: false,

          dueAmount: {
            $gt: 0,
          },

          bookingStatus: {
            $nin: [
              "cancelled",
            ],
          },
        },
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: "$dueAmount",
          },

          count: {
            $sum: 1,
          },
        },
      },
    ]),

    // --------------------------------------------------------
    // RECENT BOOKINGS
    // --------------------------------------------------------

    Booking.find({
      isDeleted: false,
    })
      .populate(
        "guestId",
        "guestCode name phone email"
      )
      .populate(
        "roomId",
        "roomNumber roomType pricePerNight"
      )
      .sort({
        createdAt: -1,
      })
      .limit(10),

    // --------------------------------------------------------
    // ROOM OCCUPANCY
    // --------------------------------------------------------

    Room.aggregate([
      {
        $match: {
          isDeleted: false,

          isActive: true,
        },
      },

      {
        $group: {
          _id: "$status",

          count: {
            $sum: 1,
          },
        },
      },
    ]),
  ]);

  // ----------------------------------------------------------
  // REVENUE
  // ----------------------------------------------------------

  const revenue =
    todayRevenue[0]?.total || 0;

  const revenueCount =
    todayRevenue[0]?.count || 0;

  // ----------------------------------------------------------
  // PENDING
  // ----------------------------------------------------------

  const due =
    pendingDue[0]?.total || 0;

  const dueCount =
    pendingDue[0]?.count || 0;

  // ----------------------------------------------------------
  // OCCUPANCY PERCENTAGE
  // ----------------------------------------------------------

  const occupancyPercentage =
    totalRooms > 0
      ? Number(
          (
            (occupiedRooms /
              totalRooms) *
            100
          ).toFixed(2)
        )
      : 0;

  // ----------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------

  return {
    summary: {
      totalRooms,

      availableRooms,

      reservedRooms,

      occupiedRooms,

      cleaningRooms,

      maintenanceRooms,

      todayRevenue: revenue,

      todayPaymentCount:
        revenueCount,

      activeBookings,

      pendingDue: due,

      pendingDueBookings:
        dueCount,

      occupancyPercentage,
    },

    recentBookings,

    occupancy,
  };
};