const express = require("express");

const router = express.Router();

const auth = require(
  "../middleware/authMiddleware"
);

const {
  createIssue,
  getIssues,
  updateIssue,
  deleteIssue,
  resolveIssue,
} = require(
  "../controllers/issueController"
);


// ➕ CREATE ISSUE
router.post(
  "/",
  auth,
  createIssue
);


// 📋 GET ISSUES
router.get(
  "/",
  auth,
  getIssues
);


// ✅ RESOLVE ISSUE / COMPLETE SERVICE
router.put(
  "/:id/resolve",
  auth,
  resolveIssue
);


// ✏️ UPDATE ISSUE
router.put(
  "/:id",
  auth,
  updateIssue
);


// ❌ DELETE ISSUE
router.delete(
  "/:id",
  auth,
  deleteIssue
);


module.exports = router;