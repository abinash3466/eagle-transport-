const express = require("express");

const router = express.Router();

const auth = require(
  "../middleware/authMiddleware"
);

const Driver = require("../models/Driver");

const Booking = require("../models/Booking");

const Truck = require("../models/Truck");

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
  createDrivers
);


// 📋 GET DRIVERS
router.get(
  "/",
  auth,
  getDrivers
);


// ✏️ UPDATE DRIVER
router.put(
  "/:id",
  auth,
  updateDrivers
);

router.delete("/:id", auth, deleteDriver);


// 💰 PAY DRIVER SALARY
router.put(
  "/:id/pay-salary",
  auth,
  payDriverSalary
);


// 🔥 DRIVER LOGIN
router.post(
  "/login",
  async (req, res) => {

    try {

      const {
        driverId,
        password,
      } = req.body;

      const driver =
        await Driver.findOne({
          driverId,
        }).populate(
          "assignedTruck"
        );

      if (
        !driver ||
        driver.password !== password
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid credentials",
        });
      }

      const booking =
        await Booking.findOne({
          driver: driver._id,
          status: {
            $ne: "Delivered",
          },
        }).populate("truck");

      res.json({
        success: true,
        driver,
        booking,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// 🚚 START TRIP
router.put(
  "/:id/start-trip",
  auth,
  async (req, res) => {

    try {

      const booking =
        await Booking.findByIdAndUpdate(
          req.params.id,
          {
            status: "In Transit",
          },
          {
            new: true,
          }
        );

      if (booking?.truck) {

        await Truck.findByIdAndUpdate(
          booking.truck,
          {
            status: "on-route",
          }
        );
      }

      res.json({
        success: true,
        booking,
      });

    } catch (error) {

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
  async (req, res) => {

    try {

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


module.exports = router;