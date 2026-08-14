const Room = require("../models/roomModel");

exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create({
      ...req.body,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      isDeleted: false,
    }).sort({
      roomNumber: 1,
    });

    res.json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findOneAndUpdate(
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

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false,
      },
      {
        isDeleted: true,
        isActive: false,
        updatedBy: req.user?._id,
      },
      {
        new: true,
      }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};