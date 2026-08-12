const express = require("express");
const jwt = require("jsonwebtoken");


const router = express.Router();
const auth = require(
  "../middleware/authMiddleware"
);
const { ownerOnly, driverOnly, ownerOrDriver } = auth;
const Driver = require("../models/Driver");
const Booking = require("../models/Booking");
const Truck = require("../models/Truck");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
console.log("Driver Routes Loaded");
const {
  createDrivers,
  getDrivers,
  updateDrivers,
  deleteDriver,
  payDriverSalary,
} = require(
  "../controllers/driverController"
);



// ➕ CREATE DRIVER
router.post(
  "/",
  auth,
  ownerOnly,
  createDrivers
);


// 📋 GET DRIVERS
router.get(
  "/",
  auth,
  ownerOnly,
  getDrivers
);


// ✏️ UPDATE DRIVER
router.put(
  "/:id",
  auth,
  ownerOnly,
  updateDrivers
);

router.delete("/:id", auth, ownerOnly, deleteDriver);


// 💰 PAY DRIVER SALARY
router.put(
  "/:id/pay-salary",
  auth,
  ownerOnly,
  payDriverSalary
);


// 🔥 DRIVER LOGIN (Updated with real JWT Token Sign)
router.post(
  "/login",
  async (req, res) => {
    console.log("Login API Hit:", req.body.driverId);

    try {
      const { driverId, password } = req.body;

      // 1. Check if driver exists
      const driver = await Driver.findOne({ driverId }).populate("assignedTruck");

      if (!driver) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials (Driver not found)",
        });
      }

      // 2. Compare Password
      const isMatch = await bcrypt.compare(password, driver.password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials (Password mismatch)",
        });
      }

      // 3. Active Booking Check
      const booking = await Booking.findOne({
        driver: driver._id,
        status: { $ne: "Delivered" },
      }).populate("truck");

      // 4. ✅ உங்களுடைய ஒரிஜினல் 'eagletransportsupersecretkey' வச்சு நிஜமான JWT டோக்கன் ஜெனரேட் செய்கிறோம்!
      const token = jwt.sign(
        {
          _id: driver._id,
          driverId: driver.driverId,
          role: "driver"
        },
        process.env.JWT_SECRET, // இது உங்களுடைய .env-ல் இருக்கும் கீ-ஐ எடுத்துக்கொள்ளும்
        { expiresIn: "7d" } // 7 நாட்கள் வரை இந்த டோக்கன் வேலை செய்யும்
      );

      // 5. Send Response with Real JWT Token
      res.json({
        success: true,
        token: token, // 👈 இப்போ ஃபிரண்ட்-எண்டிற்கு சரியான கிரிப்டோ டோக்கன் போகும்!
        driver: {
          _id: driver._id,
          name: driver.name,
          driverId: driver.driverId,
          status: driver.status,
          assignedTruck: driver.assignedTruck
        },
        booking,
      });

    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// 🚚 START TRIP
// 🚚 START TRIP (Updated to correctly find booking by Driver ID)
router.put(
  "/:id/start-trip",
  auth,
  driverOnly,
  async (req, res) => {
    if (String(req.user._id) !== String(req.params.id)) {
      return res.status(403).json({ success: false, message: "You can start only your own trip" });
    }

    console.log("Start Trip Initiated for Driver ID:", req.params.id);
    try {
      // 1. டிரைவர் ஐடி மற்றும் டெலிவரி ஆகாத ஆக்டிவ் புக்கிங்கைக் கண்டுபிடித்து ஸ்டேட்டஸை மாற்றுகிறோம்
      const booking = await Booking.findOneAndUpdate(
        { driver: req.params.id, status: { $ne: "Delivered" } },
        { status: "In Transit", currentLocation: "Trip Started" },
        { returnDocument: 'after' }
      ).populate("truck").populate("driver");

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "No active booking found for this driver",
        });
      }

      // 2. ட்ரக் ஸ்டேட்டஸை மாற்றுகிறோம்
      if (booking.truck) {
        await Truck.findByIdAndUpdate(
          booking.truck._id || booking.truck,
          { status: "on-route" }
        );
      }

      // 3. டிரைவர் ஸ்டேட்டஸை மாற்றுகிறோம்
      await Driver.findByIdAndUpdate(req.params.id, { status: "on-trip" });

      res.json({
        success: true,
        message: "Trip started successfully. Status updated to In Transit 🚚",
        booking,
      });

    } catch (error) {
      console.error("Start Trip Error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// 📜 DRIVER TRIP HISTORY
router.get(
  "/:id/trips",
  auth,
  ownerOrDriver,
  async (req, res) => {

    try {
      if (req.user.role === "driver" && String(req.user._id) !== String(req.params.id)) {
        return res.status(403).json({ success: false, message: "You can view only your own trip history" });
      }

      const trips =
        await Booking.find({
          driver: req.params.id,
          status: "Delivered",
        })
          .populate("truck")
          .sort({
            createdAt: -1,
          });

      res.json({
        success: true,
        trips,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

router.post(
  "/verify-driver-otp",
  async (req, res) => {

    try {

      const { email, driverId, otp, newPassword } = req.body;

      const identifier = driverId
        ? { driverId: String(driverId).trim() }
        : { email: String(email || "").trim().toLowerCase() };

      if (!identifier.driverId && !identifier.email) {
        return res.status(400).json({
          success: false,
          message: "Driver ID or email is required",
        });
      }

      const driver = await Driver.findOne(identifier);

      if (!driver) {
        return res.status(404).json({
          success: false,
          message:
            "Driver not found",
        });
      }

      if (!driver.otp || String(driver.otp) !== String(otp || "").trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid OTP",
        });
      }

      if (!driver.otpExpiry || new Date() > driver.otpExpiry) {
        return res.status(400).json({
          success: false,
          message:
            "OTP Expired",
        });
      }

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      driver.password =
        hashedPassword;

      driver.otp = null;
      driver.otpExpiry = null;

      await driver.save();

      res.json({
        success: true,
        message:
          "Password Updated",
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  }
);

router.post(
  "/send-driver-otp",
  async (req, res) => {

    try {

      const { email, driverId } = req.body;

      const identifier = driverId
        ? { driverId: String(driverId).trim() }
        : { email: String(email || "").trim().toLowerCase() };

      if (!identifier.driverId && !identifier.email) {
        return res.status(400).json({
          success: false,
          message: "Driver ID or email is required",
        });
      }

      const driver = await Driver.findOne(identifier);

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Driver not found",
        });
      }

      const otp =
        Math.floor(
          100000 +
          Math.random() * 900000
        ).toString();

      driver.otp = otp;

      driver.otpExpiry =
        new Date(
          Date.now() +
          10 * 60 * 1000
        );

      await driver.save();

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
        to: driver.email,
        subject:
          "Driver Password Reset OTP",
        html: `
          <h2>Eagle Transport</h2>
          <h1>${otp}</h1>
          <p>Valid for 10 minutes</p>
        `,
      });

      res.json({
        success: true,
        message: "OTP Sent",
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  }
);


router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Driver Route Working",
  });
});

module.exports = router;