const Driver = require("../models/Driver");
const Expense = require("../models/Expense");
const Booking = require("../models/Booking");
const bcrypt = require("bcryptjs");
const { DRIVER_SALARY_PERCENTAGE } = require("../config/financeConfig");


// ➕ Create Driver (Updated to accept assignedTruck and bind safely)
exports.createDrivers = async (req, res) => {
  try {
    const {
      name,
      driverId,
      password,
      email,
      phone,
      assignedTruck, // 👈 ஃபிரண்ட்-எண்ட் அனுப்பும் டிரக் ஐடியை இங்கே பிரிக்கிறோம்
    } = req.body;

    // Driver ID Validation
    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: "Driver ID is required",
      });
    }

    // Existing Driver ID Check
    const existingDriverId = await Driver.findOne({ driverId });
    if (existingDriverId) {
      return res.status(400).json({
        success: false,
        message: "Driver ID already exists",
      });
    }

    // Email Validation
    const existingEmail = await Driver.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Mobile Validation
    const existingPhone = await Driver.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already exists",
      });
    }

    // Password Validation
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Saving all information accurately to MongoDB
    const driver = await Driver.create({
      name,
      driverId,
      email,
      phone,
      password: hashedPassword,
      licenseNumber: req.body.licenseNumber || "",
      assignedTruck: assignedTruck || null, // 👈 இப்போ டேட்டாபேஸ்ல டிரக் ஐடியும் கச்சிதமா சேவ் ஆகும்!
      status: "available"
    });

    res.status(201).json({
      success: true,
      driver,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 📋 Get Drivers
exports.getDrivers = async (req, res) => {
  try {
    const drivers =
      await Driver.find().populate(
        "assignedTruck"
      );

    res.json(drivers);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ✏️ Update Driver
exports.updateDrivers = async (
  req,
  res
) => {
  try {

    const driver =
      await Driver.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    res.json({
      success: true,
      driver,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 💰 Pay Driver Salary
exports.payDriverSalary = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Salary amount must be greater than 0",
      });
    }

    // Salary is earned only for completed trips. Booking.amount is the base amount before GST.
    const completedTrips = await Booking.find({
      driver: driver._id,
      status: "Delivered",
    }).select("amount");

    const totalSalary = completedTrips.reduce((sum, trip) => {
      const tripAmount = Number(trip.amount || 0);
      return sum + (tripAmount * DRIVER_SALARY_PERCENTAGE) / 100;
    }, 0);

    // Supports both new expense records (driver field) and old records (driver id in title).
    const oldRecordPattern = new RegExp(String(driver._id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const salaryExpenses = await Expense.find({
      type: "Driver Salary",
      $or: [
        { driver: driver._id },
        { title: oldRecordPattern },
      ],
    }).select("amount");

    const alreadyPaid = salaryExpenses.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const pendingSalary = Math.max(totalSalary - alreadyPaid, 0);

    if (pendingSalary <= 0) {
      return res.status(400).json({
        success: false,
        message: "Driver salary is already fully paid",
      });
    }

    if (amount > pendingSalary + 0.01) {
      return res.status(400).json({
        success: false,
        message: `Maximum payable salary is ₹${pendingSalary.toFixed(2)}`,
      });
    }

    await Expense.create({
      title: `Driver Salary - ${driver.name} - ${driver._id}`,
      amount,
      type: "Driver Salary",
      driver: driver._id,
    });

    const updatedPaid = alreadyPaid + amount;
    const updatedPending = Math.max(totalSalary - updatedPaid, 0);

    driver.salary.totalSalary = Number(totalSalary.toFixed(2));
    driver.salary.paidSalary = Number(updatedPaid.toFixed(2));
    driver.salary.pendingSalary = Number(updatedPending.toFixed(2));
    driver.salary.salaryHistory.push({
      amount,
      paidAt: new Date(),
    });

    await driver.save();

    return res.json({
      success: true,
      message: "Salary paid successfully",
      driver,
    });
  } catch (error) {
    console.error("Salary payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Salary payment failed",
    });
  }
};

// DELETE DRIVER
exports.deleteDriver = async (req, res) => {
  try {
    const driverId = req.params.id;

    const bookingExists = await Booking.findOne({
      driver: driverId,
      status: { $ne: "Delivered" }
    });

    if (bookingExists) {
      return res.status(400).json({
        success: false,
        message: "Driver is assigned to an active booking"
      });
    }

    await Driver.findByIdAndDelete(driverId);

    res.json({
      success: true,
      message: "Driver deleted successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};