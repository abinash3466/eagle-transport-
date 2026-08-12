const mongoose = require("mongoose");
const { GST_PERCENTAGE } = require("../config/financeConfig");

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Booked", "Dispatched", "In Transit", "Delivered"],
      required: true,
    },

    note: {
      type: String,
      default: "",
    },

    updatedBy: {
      type: String,
      default: "Owner",
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const salaryHistorySchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      default: 0,
    },

    paidAt: {
      type: Date,
      default: Date.now,
    },

    receiptId: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const paymentHistorySchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      default: 0,
    },

    paymentMode: {
      type: String,
      default: "Cash",
    },

    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
    },

    otp: {
      type: String,
      default: "",
    },

    customerName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    pickup: {
      type: String,
      required: true,
    },

    drop: {
      type: String,
      required: true,
    },

    goods: {
      type: String,
      default: "",
    },

    amount: {
      type: Number,
      default: 0,
    },

    bookingType: {
      type: String,
      enum: ["public", "vip"],
      default: "public",
    },

    priority: {
      type: String,
      enum: ["normal", "high", "urgent"],
      default: "normal",
    },

    status: {
      type: String,
      enum: ["Booked", "Dispatched", "In Transit", "Delivered"],
      default: "Booked",
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: [
        {
          status: "Booked",
          note: "Booking created",
          updatedBy: "System",
        },
      ],
    },

    payment: {
      paymentMode: {
        type: String,
        default: "Cash",
      },

      advanceAmount: {
        type: Number,
        default: 0,
      },

      balanceAmount: {
        type: Number,
        default: 0,
      },

      paymentStatus: {
        type: String,
        enum: ["Pending", "Partial", "Paid"],
        default: "Pending",
      },

      // DRIVER SALARY

      driverSalary: {
        type: Number,
        default: 0,
      },

      salaryPaid: {
        type: Number,
        default: 0,
      },

      salaryPending: {
        type: Number,
        default: 0,
      },

      salaryStatus: {
        type: String,
        default: "Pending",
      },

      salaryHistory: {
        type: [salaryHistorySchema],
        default: [],
      },

      // GST

      gstPercentage: {
        type: Number,
        default: GST_PERCENTAGE,
      },

      gstAmount: {
        type: Number,
        default: 0,
      },

      totalWithGST: {
        type: Number,
        default: 0,
      },

      paymentHistory: {
        type: [paymentHistorySchema],
        default: [],
      },
    },

    currentLocation: {
      type: String,
      default: "",
    },

    liveLocation: {
      lat: {
        type: Number,
        default: 0,
      },

      lng: {
        type: Number,
        default: 0,
      },

      address: {
        type: String,
        default: "",
      },

      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },

    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);