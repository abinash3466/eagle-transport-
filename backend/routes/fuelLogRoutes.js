const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { ownerOnly, ownerOrDriver } = auth;

const {
  createFuelLog,
  getFuelLogs,
  updateFuelLog,
  deleteFuelLog,
} = require("../controllers/fuelLogController");

// Drivers may create operational logs; management actions are owner-only.
router.post("/", auth, ownerOrDriver, createFuelLog);
router.get("/", auth, ownerOnly, getFuelLogs);
router.put("/:id", auth, ownerOnly, updateFuelLog);
router.delete("/:id", auth, ownerOnly, deleteFuelLog);

module.exports = router;
