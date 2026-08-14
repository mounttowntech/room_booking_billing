// ============================================================
// CALCULATE BILLING
// ============================================================

const calculateBilling = ({
  roomRate = 0,
  nights = 0,
  items = [],
  discount = 0,
  taxPercent = 0,
  paidAmount = 0,
}) => {
  // ----------------------------------------------------------
  // ROOM AMOUNT
  // ----------------------------------------------------------

  const numericRoomRate =
    Number(roomRate) || 0;

  const numericNights =
    Number(nights) || 0;

  const roomAmount =
    numericRoomRate * numericNights;

  // ----------------------------------------------------------
  // OTHER ITEMS
  // ----------------------------------------------------------

  const calculatedItems = (
    items || []
  ).map((item) => {
    const quantity =
      Number(item.quantity) || 1;

    const rate =
      Number(item.rate) || 0;

    return {
      description:
        item.description || "",

      quantity,

      rate,

      amount:
        quantity * rate,
    };
  });

  // ----------------------------------------------------------
  // OTHER ITEM TOTAL
  // ----------------------------------------------------------

  const itemAmount =
    calculatedItems.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  // ----------------------------------------------------------
  // SUBTOTAL
  // ----------------------------------------------------------

  const subtotal =
    roomAmount + itemAmount;

  // ----------------------------------------------------------
  // DISCOUNT
  // ----------------------------------------------------------

  const discountAmount =
    Math.max(
      0,
      Number(discount) || 0
    );

  // Discount cannot be greater than subtotal

  const appliedDiscount =
    Math.min(
      discountAmount,
      subtotal
    );

  // ----------------------------------------------------------
  // TAXABLE AMOUNT
  // ----------------------------------------------------------

  const taxableAmount =
    Math.max(
      0,
      subtotal - appliedDiscount
    );

  // ----------------------------------------------------------
  // TAX
  // ----------------------------------------------------------

  const numericTaxPercent =
    Math.max(
      0,
      Number(taxPercent) || 0
    );

  const taxAmount =
    (taxableAmount *
      numericTaxPercent) /
    100;

  // ----------------------------------------------------------
  // GRAND TOTAL
  // ----------------------------------------------------------

  const totalAmount =
    taxableAmount + taxAmount;

  // ----------------------------------------------------------
  // PAID
  // ----------------------------------------------------------

  const numericPaidAmount =
    Math.max(
      0,
      Number(paidAmount) || 0
    );

  const appliedPaidAmount =
    Math.min(
      numericPaidAmount,
      totalAmount
    );

  // ----------------------------------------------------------
  // DUE
  // ----------------------------------------------------------

  const dueAmount =
    Math.max(
      0,
      totalAmount -
        appliedPaidAmount
    );

  // ----------------------------------------------------------
  // PAYMENT STATUS
  // ----------------------------------------------------------

  let paymentStatus = "unpaid";

  if (dueAmount === 0 && totalAmount > 0) {
    paymentStatus = "paid";
  } else if (appliedPaidAmount > 0) {
    paymentStatus = "partial";
  }

  return {
    roomRate: numericRoomRate,

    nights: numericNights,

    roomAmount,

    items: calculatedItems,

    itemAmount,

    subtotal,

    discount: appliedDiscount,

    taxableAmount,

    taxPercent: numericTaxPercent,

    taxAmount,

    totalAmount,

    paidAmount: appliedPaidAmount,

    dueAmount,

    paymentStatus,
  };
};

module.exports = calculateBilling;