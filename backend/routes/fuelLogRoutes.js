const express = require("express");

const router = express.Router();

const auth = require(
  "../middleware/authMiddleware"
);

const {
  createFuelLog,
  getFuelLogs,
  updateFuelLog,
  deleteFuelLog,
} = require(
  "../controllers/fuelLogController"
);


// ➕ CREATE
router.post(
  "/",
  auth,
  createFuelLog
);


// 📋 GET
router.get(
  "/",
  auth,
  getFuelLogs
);


// ✏️ UPDATE
router.put(
  "/:id",
  auth,
  updateFuelLog
);


// ❌ DELETE
router.delete(
  "/:id",
  auth,
  deleteFuelLog
);


module.exports = router;