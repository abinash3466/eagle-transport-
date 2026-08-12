const mongoose = require("mongoose");
const FuelLog = require("../models/FuelLog");

const ALLOWED_FIELDS = [
  "booking",
  "driver",
  "truck",
  "pumpName",
  "liters",
  "amount",
  "km",
  "fuelType",
  "place",
];

const pickFields = (body = {}) =>
  ALLOWED_FIELDS.reduce((payload, field) => {
    if (body[field] !== undefined) payload[field] = body[field];
    return payload;
  }, {});

const validate = (payload, { partial = false } = {}) => {
  for (const field of ["booking", "driver", "truck"]) {
    if (payload[field] && !mongoose.Types.ObjectId.isValid(String(payload[field]))) {
      return `Invalid ${field} id`;
    }
  }

  for (const field of ["liters", "amount", "km"]) {
    if (payload[field] !== undefined) {
      payload[field] = Number(payload[field]);
      if (!Number.isFinite(payload[field]) || payload[field] < 0) {
        return `${field} must be a valid non-negative number`;
      }
    }
  }

  if (!partial) {
    if (!String(payload.pumpName || "").trim()) return "Pump name is required";
    if (!(payload.liters > 0)) return "Liters must be greater than 0";
    if (!(payload.amount > 0)) return "Amount must be greater than 0";
    if (!String(payload.place || "").trim()) return "Place is required";
  }

  return null;
};

exports.createFuelLog = async (req, res) => {
  try {
    const payload = pickFields(req.body);
    const error = validate(payload);
    if (error) return res.status(400).json({ success: false, message: error });

    const fuelLog = await FuelLog.create(payload);
    return res.status(201).json({ success: true, fuelLog });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFuelLogs = async (req, res) => {
  try {
    const fuelLogs = await FuelLog.find()
      .populate("truck")
      .populate("driver")
      .sort({ createdAt: -1 });
    return res.json(fuelLogs);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFuelLog = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid fuel log id" });
    }

    const payload = pickFields(req.body);
    const error = validate(payload, { partial: true });
    if (error) return res.status(400).json({ success: false, message: error });

    const fuelLog = await FuelLog.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!fuelLog) return res.status(404).json({ success: false, message: "Fuel log not found" });
    return res.json({ success: true, fuelLog });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFuelLog = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid fuel log id" });
    }

    const fuelLog = await FuelLog.findByIdAndDelete(req.params.id);
    if (!fuelLog) return res.status(404).json({ success: false, message: "Fuel log not found" });

    return res.json({ success: true, message: "Fuel log deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
