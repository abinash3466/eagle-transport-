const mongoose = require("mongoose");
const Truck = require("../models/Truck");
const Booking = require("../models/Booking");

const ALLOWED_FIELDS = ["name", "number", "category", "capacity", "location", "status", "health", "driver", "gpsDeviceNumber", "gpsProvider", "gpsInstalled", "currentLocation", "lastCompletedLocation"];
const pickTruckFields = (body = {}) => ALLOWED_FIELDS.reduce((payload, field) => {
  if (body[field] !== undefined) payload[field] = body[field];
  return payload;
}, {});

exports.addTruck = async (req, res) => {
  try {
    const truck = await Truck.create(pickTruckFields(req.body));
    return res.status(201).json({ success: true, truck });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTruck = async (req, res) => {
  try {
    const trucks = await Truck.find().populate("driver");
    return res.json(trucks);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateTruck = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid truck id" });
    const updatedTruck = await Truck.findByIdAndUpdate(id, pickTruckFields(req.body), { new: true, runValidators: true });
    if (!updatedTruck) return res.status(404).json({ success: false, message: "Truck not found" });
    return res.json({ success: true, truck: updatedTruck });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteTruck = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid truck id" });
    const activeBooking = await Booking.findOne({ truck: id, status: { $ne: "Delivered" } });
    if (activeBooking) return res.status(400).json({ success: false, message: "Truck is assigned to an active booking" });
    const deletedTruck = await Truck.findByIdAndDelete(id);
    if (!deletedTruck) return res.status(404).json({ success: false, message: "Truck not found" });
    return res.json({ success: true, message: "Truck deleted successfully" });
  } catch (error) {
    console.error("Delete truck error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
