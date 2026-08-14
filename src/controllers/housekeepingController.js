const Housekeeping =
  require("../models/houseKeepingModel");

const Room = require("../models/roomModel");

exports.createTask = async (req, res) => {
  try {
    const task =
      await Housekeeping.create({
        ...req.body,
        createdBy: req.user?._id,
      });

    await Room.findByIdAndUpdate(
      req.body.roomId,
      {
        status: "cleaning",
      }
    );

    res.status(201).json({
      success: true,
      message:
        "Housekeeping task created successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks =
      await Housekeeping.find()
        .populate(
          "roomId",
          "roomNumber roomType"
        )
        .populate(
          "assignedTo",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateTaskStatus = async (
  req,
  res
) => {
  try {
    const task =
      await Housekeeping.findById(
        req.params.id
      );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    task.status = req.body.status;

    if (
      req.body.status === "in_progress"
    ) {
      task.startedAt = new Date();
    }

    if (
      req.body.status === "completed"
    ) {
      task.completedAt = new Date();

      await Room.findByIdAndUpdate(
        task.roomId,
        {
          status: "available",
        }
      );
    }

    task.updatedBy = req.user?._id;

    await task.save();

    res.json({
      success: true,
      message:
        "Housekeeping status updated",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};