const Booking = require("../models/bookingModel");
const Room = require("../models/roomModel");
const Guest = require("../models/guestModel");
const Invoice = require("../models/invoiceModel");

const {createInvoice} = require("../services/invoiceService");

const generateBookingNo = require(
  "../utils/generateBookingNo"
);

const calculateBilling = require(
  "../utils/calculateBilling"
);

// ============================================================
// CALCULATE NIGHTS
// ============================================================

const calculateNights = (
  checkInDate,
  checkOutDate
) => {
  const checkIn =
    new Date(checkInDate);

  const checkOut =
    new Date(checkOutDate);

  if (
    isNaN(checkIn.getTime()) ||
    isNaN(checkOut.getTime())
  ) {
    throw new Error(
      "Invalid check-in or check-out date"
    );
  }

  if (checkOut <= checkIn) {
    throw new Error(
      "Check-out date must be after check-in date"
    );
  }

  const difference =
    checkOut.getTime() -
    checkIn.getTime();

  return Math.ceil(
    difference /
      (1000 * 60 * 60 * 24)
  );
};

// ============================================================
// CHECK ROOM AVAILABILITY
// ============================================================

const checkRoomAvailability = async ({
  roomId,
  checkInDate,
  checkOutDate,
  excludeBookingId = null,
}) => {
  const room = await Room.findOne({
    _id: roomId,

    isDeleted: false,

    isActive: true,
  });

  if (!room) {
    throw new Error(
      "Room not found"
    );
  }

  // ----------------------------------------------------------
  // Find overlapping bookings
  // ----------------------------------------------------------

  const query = {
    roomId,

    isDeleted: false,

    bookingStatus: {
      $in: [
        "pending",
        "confirmed",
        "checked_in",
      ],
    },

    $and: [
      {
        checkInDate: {
          $lt: new Date(checkOutDate),
        },
      },
      {
        checkOutDate: {
          $gt: new Date(checkInDate),
        },
      },
    ],
  };

  if (excludeBookingId) {
    query._id = {
      $ne: excludeBookingId,
    };
  }

  const existingBooking =
    await Booking.findOne(query);

  return {
    available: !existingBooking,

    room,

    existingBooking,
  };
};

// ============================================================
// CREATE BOOKING
// ============================================================

exports.createBooking = async ({
  guestId,
  roomId,
  checkInDate,
  checkOutDate,
  adults = 1,
  children = 0,
  discount = 0,
  taxPercent = 0,
  source = "walk_in",
  specialRequest,
  notes,
  createdBy,
}) => {
  // ----------------------------------------------------------
  // Validate Guest
  // ----------------------------------------------------------

  const guest = await Guest.findOne({
    _id: guestId,

    isDeleted: false,
  });

  if (!guest) {
    throw new Error(
      "Guest not found"
    );
  }

  // ----------------------------------------------------------
  // Validate Dates
  // ----------------------------------------------------------

  const nights =
    calculateNights(
      checkInDate,
      checkOutDate
    );

  // ----------------------------------------------------------
  // Check Room
  // ----------------------------------------------------------

  const availability =
    await checkRoomAvailability({
      roomId,
      checkInDate,
      checkOutDate,
    });

  if (!availability.available) {
    throw new Error(
      "Room is already booked for the selected dates"
    );
  }

  const room =
    availability.room;

  // ----------------------------------------------------------
  // Calculate Billing
  // ----------------------------------------------------------

  const billing =
    calculateBilling({
      roomRate:
        room.pricePerNight,

      nights,

      discount,

      taxPercent,

      paidAmount: 0,
    });

  // ----------------------------------------------------------
  // Create Booking
  // ----------------------------------------------------------

  const booking =
    await Booking.create({
      bookingNo:
        generateBookingNo(),

      guestId,

      roomId,

      checkInDate,

      checkOutDate,

      adults,

      children,

      nights,

      roomRate:
        room.pricePerNight,

      roomAmount:
        billing.roomAmount,

      discount:
        billing.discount,

      taxAmount:
        billing.taxAmount,

      totalAmount:
        billing.totalAmount,

      paidAmount: 0,

      dueAmount:
        billing.dueAmount,

      bookingStatus:
        "confirmed",

      paymentStatus:
        "unpaid",

      source,

      specialRequest,

      notes,

      createdBy,
    });

  // ----------------------------------------------------------
  // Update Room
  // ----------------------------------------------------------

  await Room.findByIdAndUpdate(
    roomId,
    {
      status: "reserved",

      updatedBy: createdBy,
    }
  );

  // ----------------------------------------------------------
  // Populate
  // ----------------------------------------------------------

  return Booking.findById(
    booking._id
  )
    .populate(
      "guestId",
      "guestCode name phone email"
    )
    .populate(
      "roomId",
      "roomNumber roomType pricePerNight"
    );
};

// ============================================================
// GET ALL BOOKINGS
// ============================================================

exports.getBookings = async ({
  status,
  search,
}) => {
  const filter = {
    isDeleted: false,
  };

  if (status) {
    filter.bookingStatus =
      status;
  }

  if (search) {
    filter.bookingNo = {
      $regex: search,
      $options: "i",
    };
  }

  return Booking.find(filter)
    .populate(
      "guestId",
      "guestCode name phone email"
    )
    .populate(
      "roomId",
      "roomNumber roomType pricePerNight status"
    )
    .sort({
      createdAt: -1,
    });
};

// ============================================================
// GET BOOKING
// ============================================================

exports.getBookingById = async (
  bookingId
) => {
  return Booking.findOne({
    _id: bookingId,

    isDeleted: false,
  })
    .populate("guestId")
    .populate("roomId");
};

// ============================================================
// CHECK IN
// ============================================================

exports.checkInBooking = async ({
  bookingId,
  updatedBy,
}) => {
  const booking =
    await Booking.findOne({
      _id: bookingId,

      isDeleted: false,
    });

  if (!booking) {
    throw new Error(
      "Booking not found"
    );
  }

  if (
    booking.bookingStatus !==
      "confirmed" &&
    booking.bookingStatus !==
      "pending"
  ) {
    throw new Error(
      "Booking cannot be checked in"
    );
  }

  booking.bookingStatus =
    "checked_in";

  booking.updatedBy =
    updatedBy;

  await booking.save();

  await Room.findByIdAndUpdate(
    booking.roomId,
    {
      status: "occupied",

      updatedBy,
    }
  );

  return booking;
};

// ============================================================
// CHECK OUT
// ============================================================

exports.checkOutBooking = async ({
  bookingId,
  updatedBy,
}) => {
  const booking =
    await Booking.findOne({
      _id: bookingId,

      isDeleted: false,
    });

  if (!booking) {
    throw new Error(
      "Booking not found"
    );
  }

  if (
    booking.bookingStatus !==
    "checked_in"
  ) {
    throw new Error(
      "Only checked-in booking can be checked out"
    );
  }

   // ----------------------------------------------------------
  // Check Existing Invoice
  // ----------------------------------------------------------

  let invoice =
    await Invoice.findOne({
      bookingId: booking._id,
      isDeleted: false,
      status: {
        $ne: "cancelled",
      },
    });

  // ----------------------------------------------------------
  // Create Invoice if not exists
  // ----------------------------------------------------------
// discount = 0,
//   taxPercent = 0,
//   dueDate,
//   notes,
//   createdBy
  if (!invoice) {
    invoice = await createInvoice({
  bookingId: booking._id,
  guestId: booking.guestId,
  discount: booking.discount || 0,
  taxPercent: booking.taxPercent || 0,
  dueDate: new Date(),
  notes: booking.notes,
  createdBy: updatedBy,
});

  }

  if (
   Number(invoice.dueAmount) > 0
  ) {
    throw new Error(
      `Pending payment of ₹${invoice.dueAmount} must be collected before checkout`
    );
  }

  booking.bookingStatus =
    "checked_out";

  booking.updatedBy =
    updatedBy;

  await booking.save();

  // ----------------------------------------------------------
  // Room goes to cleaning
  // ----------------------------------------------------------

  await Room.findByIdAndUpdate(
    booking.roomId,
    {
      status: "cleaning",

      updatedBy,
    }
  );

  return booking;
};

// ============================================================
// CANCEL BOOKING
// ============================================================

exports.cancelBooking = async ({
  bookingId,
  reason,
  updatedBy,
}) => {
  const booking =
    await Booking.findOne({
      _id: bookingId,

      isDeleted: false,
    });

  if (!booking) {
    throw new Error(
      "Booking not found"
    );
  }

  if (
    [
      "checked_out",
      "cancelled",
    ].includes(
      booking.bookingStatus
    )
  ) {
    throw new Error(
      "Booking cannot be cancelled"
    );
  }

  booking.bookingStatus =
    "cancelled";

  booking.cancelledAt =
    new Date();

  booking.cancellationReason =
    reason || "";

  booking.updatedBy =
    updatedBy;

  await booking.save();

  await Room.findByIdAndUpdate(
    booking.roomId,
    {
      status: "available",

      updatedBy,
    }
  );

  return booking;
};

// ============================================================
// UPDATE BOOKING
// ============================================================

exports.updateBooking = async ({
  bookingId,
  data,
  updatedBy,
}) => {
  const booking =
    await Booking.findOne({
      _id: bookingId,

      isDeleted: false,
    });

  if (!booking) {
    throw new Error(
      "Booking not found"
    );
  }

  if (
    booking.bookingStatus ===
    "checked_out"
  ) {
    throw new Error(
      "Checked-out booking cannot be updated"
    );
  }

  const newRoomId =
    data.roomId ||
    booking.roomId;

  const newCheckInDate =
    data.checkInDate ||
    booking.checkInDate;

  const newCheckOutDate =
    data.checkOutDate ||
    booking.checkOutDate;

  // ----------------------------------------------------------
  // Check availability when dates/room change
  // ----------------------------------------------------------

  if (
    String(newRoomId) !==
      String(booking.roomId) ||
    newCheckInDate !=
      booking.checkInDate ||
    newCheckOutDate !=
      booking.checkOutDate
  ) {
    const availability =
      await checkRoomAvailability({
        roomId: newRoomId,

        checkInDate:
          newCheckInDate,

        checkOutDate:
          newCheckOutDate,

        excludeBookingId:
          bookingId,
      });

    if (!availability.available) {
      throw new Error(
        "Room is not available for the selected dates"
      );
    }
  }

  const nights =
    calculateNights(
      newCheckInDate,
      newCheckOutDate
    );

  const room =
    await Room.findById(
      newRoomId
    );

  if (!room) {
    throw new Error(
      "Room not found"
    );
  }

  const billing =
    calculateBilling({
      roomRate:
        room.pricePerNight,

      nights,

      discount:
        data.discount ??
        booking.discount,

      taxPercent:
        data.taxPercent ??
        0,

      paidAmount: data.paidAmount ?? booking.paidAmount,
    });

  //   console.log(
  //   "Calculated booking:",
  //   booking
  // );  

  //   console.log(
  //   "Calculated billing:",
  //   billing
  // );

  booking.roomId =
    newRoomId;

  booking.checkInDate =
    newCheckInDate;

  booking.checkOutDate =
    newCheckOutDate;

  booking.nights =
    nights;

  booking.roomRate =
    room.pricePerNight;

  booking.roomAmount =
    billing.roomAmount;

  booking.discount =
    billing.discount;

  booking.taxAmount =
    billing.taxAmount;

  booking.totalAmount =
    billing.totalAmount;

  booking.dueAmount = data.dueAmount ?? billing.dueAmount;

  booking.paymentStatus = data.paymentStatus ?? billing.paymentStatus;

  booking.bookingStatus = data.bookingStatus ?? booking.bookingStatus;

  if (data.adults !== undefined) {
    booking.adults =
      data.adults;
  }

  if (
    data.children !== undefined
  ) {
    booking.children =
      data.children;
  }

  if (data.source !== undefined) {
    booking.source =
      data.source;
  }

  if (
    data.specialRequest !==
    undefined
  ) {
    booking.specialRequest =
      data.specialRequest;
  }

  if (data.notes !== undefined) {
    booking.notes =
      data.notes;
  }

  booking.updatedBy =
    updatedBy;

  await booking.save();

  return Booking.findById(
    booking._id
  )
    .populate("guestId")
    .populate("roomId");
};

// ============================================================
// GET BOOKING PAYMENT SUMMARY
// ============================================================

exports.getBookingPaymentSummary = async () => {
  try {
  const bookings = await Booking.find({
    isDeleted: false,

    paymentStatus: {
      $in: [
        "unpaid",
        "partial",
        "paid",
      ],
    },
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
    .lean();

    console.log("Booking payment summary:",  bookings);

  return bookings;
  } catch (error) {
    console.log('error', error);
    throw new Error(
      "Error fetching booking payment summary: " +
        error.message
    );
  }
};