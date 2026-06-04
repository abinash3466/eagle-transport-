const mongoose = require("mongoose");

const tollSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  truck: { type: mongoose.Schema.Types.ObjectId, ref: "Truck" },

  tollgate: String,
  amount: Number,
  paymentMethod: String,
  place: String,
  status: {
  type: String,
  default: "Paid"
}
}, { timestamps: true });

module.exports = mongoose.model("TollLog", tollSchema);