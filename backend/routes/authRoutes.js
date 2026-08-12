const express = require("express");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const router = express.Router();

/* --------------------------------
   OWNER LOGIN
-------------------------------- */

router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({
      email,
      role: "owner",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Owner account not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
});

router.post("/send-owner-otp", async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({
      email,
      role: "owner",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Owner account not found",
      });
    }

    const otp =
      Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;

    user.otpExpiry =
      new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    const transporter =
      nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Eagle Transport Password Reset OTP",
      html: `
        <h2>Eagle Transport</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 10 minutes.</p>
      `,
    });

    res.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
});

router.post("/verify-owner-otp", async (req, res) => {
  try {

    const {
      email,
      otp,
      newPassword
    } = req.body;

    const user = await User.findOne({
      email,
      role: "owner",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    if (
      !user.otp ||
      user.otp !== otp
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      !user.otpExpiry ||
      new Date() > user.otpExpiry
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
});

module.exports = router;