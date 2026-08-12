const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const driverSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,

    driverId: {
      type: String,
      unique: true,
    },

    password: String,

    licenseNumber: String,

    assignedTruck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      default: null,
    },

    status: {
      type: String,
      default: "available",
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },

    salary: {
      totalSalary: {
        type: Number,
        default: 0,
      },

      paidSalary: {
        type: Number,
        default: 0,
      },

      pendingSalary: {
        type: Number,
        default: 0,
      },

      salaryHistory: [
        {
          amount: Number,

          paidAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);