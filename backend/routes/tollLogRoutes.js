const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { ownerOnly, ownerOrDriver } = auth;

const {
  createTollLog,
  getTollLogs,
  updateTollLog,
  deleteTollLog,
} = require("../controllers/tollLogController");

// Drivers may create operational logs; management actions are owner-only.
router.post("/", auth, ownerOrDriver, createTollLog);
router.get("/", auth, ownerOnly, getTollLogs);
router.put("/:id", auth, ownerOnly, updateTollLog);
router.delete("/:id", auth, ownerOnly, deleteTollLog);

module.exports = router;
