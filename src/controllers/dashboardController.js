const dashboardService = require(
  "../services/dashboardService"
);

// ============================================================
// GET DASHBOARD
// ============================================================

exports.getDashboard = async (
  req,
  res
) => {
  try {
    const dashboard =
      await dashboardService.getDashboard();

    res.json({
      success: true,

      data: dashboard,
    });
  } catch (error) {
    console.error(
      "Dashboard Error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        error.message,
    });
  }
};