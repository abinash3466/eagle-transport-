const mongoose = require("mongoose");

const fuelSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
    truck: { type: mongoose.Schema.Types.ObjectId, ref: "Truck" },

    pumpName: String,
    liters: Number,
    amount: Number,
    km: Number,
    fuelType: String,
    place: String,
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.FuelLog || mongoose.model("FuelLog", fuelSchema);