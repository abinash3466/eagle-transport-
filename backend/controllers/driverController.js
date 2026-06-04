const Driver = require("../models/Driver");
const Expense = require("../models/Expense");


// ➕ Create Driver
exports.createDrivers = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);

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
exports.payDriverSalary =
  async (req, res) => {

    try {

      const driver =
        await Driver.findById(
          req.params.id
        );

      if (!driver) {
        return res.status(404).json({
          success: false,
          message:
            "Driver not found",
        });
      }

      const amount = Number(
        req.body.amount || 0
      );

      if (!driver.salary) {
        driver.salary = {
          totalSalary: 0,
          paidSalary: 0,
          pendingSalary: 0,
          salaryHistory: [],
        };
      }

      driver.salary.paidSalary += amount;

      driver.salary.pendingSalary =
        Math.max(
          driver.salary.totalSalary -
          driver.salary.paidSalary,
          0
        );

      driver.salary.salaryHistory.push({
        amount,
        paidAt: new Date(),
      });

      await Expense.create({
        title:
          `Driver Salary - ${driver.name} - ${driver._id}`,

        amount,

        type: "Driver Salary",
      });

      await driver.save();

      res.json({
        success: true,
        driver,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message:
          "Salary payment failed",
      });
    }
  };

// DELETE DRIVER
exports.deleteDriver = async (req, res) => {
  try {

    await Driver.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Driver deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};