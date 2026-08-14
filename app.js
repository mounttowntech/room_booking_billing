
const express = require("express");

const app = express();

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is working",
  });
});

app.use("/api/users",require("./src/routes/authRoutes"));
app.use("/api/booking",require("./src/routes/bookingRoutes"));
app.use("/api/dashboard",require("./src/routes/dashboardRoutes"));
app.use("/api/guest",require("./src/routes/guestRoutes"));
app.use("/api/housekeeping",require("./src/routes/housekeepingRoutes"));
app.use("/api/invoice",require("./src/routes/invoiceRoutes"));
app.use("/api/payments",require("./src/routes/paymentRoutes"));
app.use("/api/rooms",require("./src/routes/roomRoutes"));
app.use("/api/reports",require("./src/routes/reportRoutes"));
app.use("/api/settings",require("./src/routes/settingRoutes"))
module.exports = app;