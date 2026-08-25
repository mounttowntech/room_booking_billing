// ============================================================
// IMPORTS
// ============================================================

const UserModel = require("../models/userModel");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ============================================================
// EMAIL UTILITIES
// ============================================================

const sendMail = require("../utils/sendMail");

// ============================================================
// EMAIL TEMPLATES
// ============================================================

const registerEmail = require("../templates/registerEmail");
const loginEmail = require("../templates/loginEmail");
const forgotPasswordEmail = require("../templates/forgotPasswordEmail");
const resetPasswordEmail = require("../templates/resetPasswordEmail");
const changePasswordEmail = require("../templates/changePasswordEmail");

// ============================================================
// SAFE EMAIL FUNCTION
// ============================================================

const sendEmailSafely = async ({
  to,
  subject,
  html,
}) => {
  try {
    await sendMail({
      to,
      subject,
      html,
    });

    console.log(
      `Email sent successfully to ${to}`
    );
  } catch (error) {
    console.error(
      `Failed to send email to ${to}`
    );

    console.error(error.message);
  }
};

// ============================================================
// REGISTER
// ============================================================

exports.register = async (req, res) => {
  try {
    let {
      name,
      email,
      mobileNumber,
      password,
      role,
    } = req.body;

    // ============================================================
    // TRIM / NORMALIZE
    // ============================================================

    name = name?.trim();

    email = email
      ?.trim()
      .toLowerCase();

    mobileNumber =
      mobileNumber?.trim();

    role = role
      ?.trim()
      .toLowerCase();

    // ============================================================
    // VALIDATION
    // ============================================================

    if (
      !name ||
      !email ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password and role are required.",
      });
    }

    // ============================================================
    // PASSWORD LENGTH
    // ============================================================

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters.",
      });
    }

    // ============================================================
    // VALID ROLES
    // ============================================================

    const allowedRoles = [
      "admin",
      "manager",
      "receptionist",
      "housekeeping",
      "accountant",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
    }

    // ============================================================
    // CHECK EMAIL
    // ============================================================

    const emailExists =
      await UserModel.findOne({
        email,
      });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message:
          "Email already exists.",
      });
    }

    // ============================================================
    // CHECK MOBILE NUMBER
    // ============================================================

    if (mobileNumber) {
      const mobileExists =
        await UserModel.findOne({
          mobileNumber,
        });

      if (mobileExists) {
        return res.status(400).json({
          success: false,
          message:
            "Mobile number already exists.",
        });
      }
    }

    // ============================================================
    // CREATE USER
    // ============================================================

    const user =
      await UserModel.create({
        name,
        email,
        mobileNumber,
        password,
        role,
      });

    // ============================================================
    // SEND REGISTER EMAIL
    // ============================================================

    await sendEmailSafely({
      to: user.email,
      subject:
        "Welcome to WonderBill",
      html: registerEmail(user),
    });

    // ============================================================
    // REMOVE PASSWORD FROM RESPONSE
    // ============================================================

    const userData =
      user.toObject();

    delete userData.password;

    // ============================================================
    // RESPONSE
    // ============================================================

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully.",
      data: userData,
    });

  } catch (error) {
    console.error(error);

    // ============================================================
    // DUPLICATE KEY ERROR
    // ============================================================

    if (error.code === 11000) {
      const field =
        Object.keys(
          error.keyPattern
        )[0];

      return res.status(400).json({
        success: false,
        message:
          `${field} already exists.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// LOGIN
// ============================================================

exports.login = async (req, res) => {
  try {
    let {
      email,
      password,
    } = req.body;

    // ============================================================
    // VALIDATION
    // ============================================================

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    // ============================================================
    // NORMALIZE EMAIL
    // ============================================================

    email = email
      .trim()
      .toLowerCase();

    // ============================================================
    // FIND USER
    // ============================================================

    const user =
      await UserModel.findOne({
        email,
      }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Invalid email.",
      });
    }

    // ============================================================
    // CHECK ACTIVE STATUS
    // ============================================================

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Account is inactive.",
      });
    }

    // ============================================================
    // CHECK PASSWORD
    // ============================================================

    const match =
      await user.comparePassword(
        password
      );

    if (!match) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid password.",
      });
    }

    // ============================================================
    // CREATE JWT
    // ============================================================

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn:
          process.env.JWT_EXPIRE ||
          "7d",
      }
    );

    // ============================================================
    // UPDATE LAST LOGIN
    // ============================================================

    user.lastLoginAt =
      new Date();

    await user.save();

    // ============================================================
    // SEND LOGIN EMAIL
    // ============================================================

    await sendEmailSafely({
      to: user.email,
      subject:
        "Successful Login",
      html: loginEmail(user),
    });

    // ============================================================
    // REMOVE PASSWORD
    // ============================================================

    const userData =
      user.toObject();

    delete userData.password;

    // ============================================================
    // RESPONSE
    // ============================================================

    return res.status(200).json({
      success: true,
      message:
        "Login successful.",
      token,
      user: userData,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// FORGOT PASSWORD
// SEND OTP + RESET LINK
// ============================================================

exports.forgotPassword = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    // ============================================================
    // VALIDATION
    // ============================================================

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email is required.",
      });
    }

    // ============================================================
    // NORMALIZE EMAIL
    // ============================================================

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    // ============================================================
    // FIND USER
    // ============================================================

    const user =
      await UserModel.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    // ============================================================
    // CHECK ACCOUNT
    // ============================================================

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Account is inactive.",
      });
    }

    // ============================================================
    // GENERATE 6 DIGIT OTP
    // ============================================================

    const otp = crypto
      .randomInt(
        100000,
        1000000
      )
      .toString();

    // ============================================================
    // OTP EXPIRY
    // 10 MINUTES
    // ============================================================

    const otpExpire =
      new Date(
        Date.now() +
          10 * 60 * 1000
      );

    // ============================================================
    // GENERATE RESET TOKEN
    // ============================================================

    const token =
      jwt.sign(
        {
          id: user._id,
          type: "password-reset",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "15m",
        }
      );

    // ============================================================
    // CREATE RESET LINK
    // ============================================================

    const resetLink =
      `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // ============================================================
    // SAVE OTP DETAILS
    // ============================================================

    user.resetPasswordOTP =
      otp;

    user.resetPasswordOTPExpire =
      otpExpire;

    user.resetPasswordOTPVerified =
      false;

    user.resetPasswordOTPAttempts =
      0;

    await user.save();

    // ============================================================
    // SEND OTP + LINK
    // ============================================================

    await sendMail({
      to: user.email,
      subject:
        "Password Reset - OTP & Reset Link",
      html:
        forgotPasswordEmail(
          user,
          otp,
          resetLink
        ),
    });

    // ============================================================
    // RESPONSE
    // ============================================================

    return res.status(200).json({
      success: true,
      message:
        "OTP and reset link sent successfully.",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// VERIFY FORGOT PASSWORD OTP
// ============================================================

exports.verifyForgotPasswordOTP =
  async (req, res) => {
    try {
      const {
        email,
        otp,
      } = req.body;

      // ============================================================
      // VALIDATION
      // ============================================================

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message:
            "Email and OTP are required.",
        });
      }

      // ============================================================
      // NORMALIZE EMAIL
      // ============================================================

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      // ============================================================
      // FIND USER
      // ============================================================

      const user =
        await UserModel.findOne({
          email: normalizedEmail,
        }).select(
          "+resetPasswordOTP " +
          "+resetPasswordOTPExpire " +
          "+resetPasswordOTPVerified " +
          "+resetPasswordOTPAttempts"
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      // ============================================================
      // CHECK OTP
      // ============================================================

      if (!user.resetPasswordOTP) {
        return res.status(400).json({
          success: false,
          message:
            "OTP not found. Please request a new OTP.",
        });
      }

      // ============================================================
      // CHECK EXPIRY
      // ============================================================

      if (
        !user.resetPasswordOTPExpire ||
        user.resetPasswordOTPExpire <
          new Date()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "OTP expired. Please request a new OTP.",
        });
      }

      // ============================================================
      // MAX ATTEMPTS
      // ============================================================

      if (
        user.resetPasswordOTPAttempts >=
        5
      ) {
        return res.status(429).json({
          success: false,
          message:
            "Maximum OTP attempts exceeded. Please request a new OTP.",
        });
      }

      // ============================================================
      // CHECK OTP
      // ============================================================

      if (
        user.resetPasswordOTP !==
        otp.toString()
      ) {
        user.resetPasswordOTPAttempts +=
          1;

        await user.save();

        return res.status(400).json({
          success: false,
          message:
            "Invalid OTP.",
          attemptsRemaining:
            Math.max(
              0,
              5 -
                user.resetPasswordOTPAttempts
            ),
        });
      }

      // ============================================================
      // OTP VERIFIED
      // ============================================================

      user.resetPasswordOTPVerified =
        true;

      await user.save();

      // ============================================================
      // RESPONSE
      // ============================================================

      return res.status(200).json({
        success: true,
        message:
          "OTP verified successfully.",
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// ============================================================
// RESET PASSWORD USING OTP
// ============================================================

exports.resetPasswordUsingOTP =
  async (req, res) => {
    try {
      const {
        email,
        otp,
        password,
      } = req.body;

      // ============================================================
      // VALIDATION
      // ============================================================

      if (
        !email ||
        !otp ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email, OTP and password are required.",
        });
      }

      // ============================================================
      // PASSWORD LENGTH
      // ============================================================

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters.",
        });
      }

      // ============================================================
      // NORMALIZE EMAIL
      // ============================================================

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      // ============================================================
      // FIND USER
      // ============================================================

      const user =
        await UserModel.findOne({
          email: normalizedEmail,
        }).select(
          "+password " +
          "+resetPasswordOTP " +
          "+resetPasswordOTPExpire " +
          "+resetPasswordOTPVerified " +
          "+resetPasswordOTPAttempts"
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      // ============================================================
      // CHECK OTP
      // ============================================================

      if (
        !user.resetPasswordOTP ||
        user.resetPasswordOTP !==
          otp.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid OTP.",
        });
      }

      // ============================================================
      // CHECK EXPIRY
      // ============================================================

      if (
        !user.resetPasswordOTPExpire ||
        user.resetPasswordOTPExpire <
          new Date()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "OTP expired.",
        });
      }

      // ============================================================
      // CHECK VERIFIED
      // ============================================================

      if (
        !user.resetPasswordOTPVerified
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please verify OTP first.",
        });
      }

      // ============================================================
      // UPDATE PASSWORD
      // ============================================================

      user.password =
        password;

      user.passwordChangedAt =
        new Date();

      // ============================================================
      // CLEAR OTP
      // ============================================================

      user.resetPasswordOTP =
        null;

      user.resetPasswordOTPExpire =
        null;

      user.resetPasswordOTPVerified =
        false;

      user.resetPasswordOTPAttempts =
        0;

      await user.save();

      // ============================================================
      // SUCCESS EMAIL
      // ============================================================

      await sendEmailSafely({
        to: user.email,
        subject:
          "Password Reset Successful",
        html:
          resetPasswordEmail(user),
      });

      // ============================================================
      // RESPONSE
      // ============================================================

      return res.status(200).json({
        success: true,
        message:
          "Password reset successfully.",
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };



// ============================================================
// CHANGE PASSWORD
// ============================================================

exports.changePassword =
  async (req, res) => {
    try {
      const {
        oldPassword,
        newPassword,
      } = req.body;

      // ============================================================
      // VALIDATION
      // ============================================================

      if (
        !oldPassword ||
        !newPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Old password and new password are required.",
        });
      }

      // ============================================================
      // PASSWORD LENGTH
      // ============================================================

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be at least 6 characters.",
        });
      }

      // ============================================================
      // FIND USER
      // ============================================================

      const user =
        await UserModel.findById(
          req.user.id
        ).select("+password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      // ============================================================
      // CHECK OLD PASSWORD
      // ============================================================

      const match =
        await user.comparePassword(
          oldPassword
        );

      if (!match) {
        return res.status(400).json({
          success: false,
          message:
            "Old password is incorrect.",
        });
      }

      // ============================================================
      // UPDATE PASSWORD
      // ============================================================

      user.password =
        newPassword;

      user.passwordChangedAt =
        new Date();

      await user.save();

      // ============================================================
      // SEND EMAIL
      // ============================================================

      await sendEmailSafely({
        to: user.email,
        subject:
          "Password Changed Successfully",
        html:
          changePasswordEmail(user),
      });

      // ============================================================
      // RESPONSE
      // ============================================================

      return res.status(200).json({
        success: true,
        message:
          "Password updated successfully.",
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// ============================================================
// GET CURRENT USER
// ============================================================

exports.me = async (req, res) => {
  try {
    const user =
      await UserModel.findById(
        req.user.id
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// get housekeeping staff
// ============================================================
exports.getHousekeepingStaff = async (req, res) => {
  try {
    const staff = await UserModel.find({
      role: "housekeeping",
    }).select("-password");

    return res.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}