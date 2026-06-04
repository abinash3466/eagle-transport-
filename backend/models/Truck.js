const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema({
  name: String,
  number: String,
  category: String,
  capacity: String,
  location: String,
  status: {
    type: String,
    default: "idle"
  },
  health: {
    type: String,
    default: "good"
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver"
  },
  gpsDeviceNumber: {
  type: String,
  default: "",
},

gpsProvider: {
  type: String,
  default: "",
},

gpsInstalled: {
  type: Boolean,
  default: false,
},

lastGpsLocation: {
  lat: {
    type: Number,
    default: 0,
  },

  lng: {
    type: Number,
    default: 0,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
},

  currentLocation: {
  lat: Number,
  lng: Number,
  place: String,
},

lastCompletedLocation: {
  lat: Number,
  lng: Number,
  place: String,
},
}, { timestamps: true });

module.exports = mongoose.model("Truck", truckSchema);