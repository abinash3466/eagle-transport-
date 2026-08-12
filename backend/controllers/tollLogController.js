const mongoose = require("mongoose");
const TollLog = require("../models/TollLog");

const ALLOWED_FIELDS = [
  "booking",
  "driver",
  "truck",
  "tollgate",
  "amount",
  "paymentMethod",
  "place",
  "status",
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

  if (payload.amount !== undefined) {
    payload.amount = Number(payload.amount);
    if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
      return "Amount must be greater than 0";
    }
  }

  if (!partial) {
    if (!String(payload.tollgate || "").trim()) return "Tollgate is required";
    if (!String(payload.place || "").trim()) return "Place is required";
    if (!(payload.amount > 0)) return "Amount must be greater than 0";
  }

  return null;
};

exports.createTollLog = async (req, res) => {
  try {
    const payload = pickFields(req.body);
    const error = validate(payload);
    if (error) return res.status(400).json({ success: false, message: error });

    const tollLog = await TollLog.create(payload);
    return res.status(201).json({ success: true, tollLog });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTollLogs = async (req, res) => {
  try {
    const tollLogs = await TollLog.find()
      .populate("truck")
      .populate("driver")
      .sort({ createdAt: -1 });
    return res.json(tollLogs);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTollLog = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid toll log id" });
    }

    const payload = pickFields(req.body);
    const error = validate(payload, { partial: true });
    if (error) return res.status(400).json({ success: false, message: error });

    const tollLog = await TollLog.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!tollLog) return res.status(404).json({ success: false, message: "Toll log not found" });
    return res.json({ success: true, tollLog });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTollLog = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid toll log id" });
    }

    const tollLog = await TollLog.findByIdAndDelete(req.params.id);
    if (!tollLog) return res.status(404).json({ success: false, message: "Toll log not found" });

    return res.json({ success: true, message: "Toll log deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
