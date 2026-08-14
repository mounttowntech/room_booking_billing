const Guest = require("../models/guestModel");

const generateGuestCode = () => {
  return `GST-${Date.now()}`;
};

exports.createGuest = async (req, res) => {
  try {
    const guest = await Guest.create({
      ...req.body,
      guestCode: generateGuestCode(),
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: "Guest created successfully",
      data: guest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getGuests = async (req, res) => {
  try {
    const guests = await Guest.find({
      isDeleted: false,
    }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: guests.length,
      data: guests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getGuestById = async (req, res) => {
  try {
    const guest = await Guest.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }

    res.json({
      success: true,
      data: guest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateGuest = async (req, res) => {
  try {
    const guest = await Guest.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false,
      },
      {
        ...req.body,
        updatedBy: req.user?._id,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }

    res.json({
      success: true,
      message: "Guest updated successfully",
      data: guest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteGuest = async (req, res) => {
  try {
    const guest = await Guest.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false,
      },
      {
        isDeleted: true,
        updatedBy: req.user?._id,
      },
      {
        new: true,
      }
    );

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }

    res.json({
      success: true,
      message: "Guest deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};