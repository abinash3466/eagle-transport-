const express = require("express");

const router = express.Router();

const auth = require(
  "../middleware/authMiddleware"
);

const {
  createTollLog,
  getTollLogs,
  updateTollLog,
  deleteTollLog,
} = require(
  "../controllers/tollLogController"
);


// ➕ CREATE
router.post(
  "/",
  auth,
  createTollLog
);


// 📋 GET
router.get(
  "/",
  auth,
  getTollLogs
);


// ✏️ UPDATE
router.put(
  "/:id",
  auth,
  updateTollLog
);


// ❌ DELETE
router.delete(
  "/:id",
  auth,
  deleteTollLog
);


module.exports = router;