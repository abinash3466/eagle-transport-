const mongoose = require("mongoose");

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