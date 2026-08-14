const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

// ============================================================
// VERIFY TOKEN
// ============================================================

exports.verifyToken = async (req, res, next) => {
  try {
    // ----------------------------------------------------------
    // Get Authorization Header
    // ----------------------------------------------------------

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required.",
      });
    }

    // ----------------------------------------------------------
    // Check Bearer Token
    // ----------------------------------------------------------

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing.",
      });
    }

    // ----------------------------------------------------------
    // Verify JWT
    // ----------------------------------------------------------

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired. Please login again.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    // ----------------------------------------------------------
    // Check User ID
    // ----------------------------------------------------------

    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    // ----------------------------------------------------------
    // Find User
    // ----------------------------------------------------------

    const user = await UserModel.findById(decoded.id).select(
      "-password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    // ----------------------------------------------------------
    // Check Active Status
    // ----------------------------------------------------------

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    // ----------------------------------------------------------
    // Password Changed Check
    // ----------------------------------------------------------
    // If passwordChangedAt is newer than token issued time,
    // invalidate the old token.
    // ----------------------------------------------------------

    if (
      user.passwordChangedAt &&
      decoded.iat
    ) {
      const passwordChangedTimestamp =
        Math.floor(
          new Date(user.passwordChangedAt).getTime() /
            1000
        );

      if (
        passwordChangedTimestamp > decoded.iat
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Password was changed. Please login again.",
        });
      }
    }

    // ----------------------------------------------------------
    // Attach User To Request
    // ----------------------------------------------------------

    req.user = user;

    // Also keep decoded token if needed
    req.auth = decoded;

    next();
  } catch (error) {
    console.error(
      "AUTH MIDDLEWARE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

// ============================================================
// ALLOW ROLES
// ============================================================

exports.allowRoles = (...roles) => {
  return (req, res, next) => {
    try {
      // --------------------------------------------------------
      // Check Authentication
      // --------------------------------------------------------

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      // --------------------------------------------------------
      // Check User Role
      // --------------------------------------------------------

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to access this resource.",
        });
      }

      next();
    } catch (error) {
      console.error(
        "ROLE MIDDLEWARE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Role authorization failed.",
      });
    }
  };
};