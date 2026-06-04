const express = require("express");

const router = express.Router();

const auth = require(
    "../middleware/authMiddleware"
);

const {
    addExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
} = require(
    "../controllers/expenseController"
);

// ➕ Add Expense
router.post(
    "/",
    auth,
    addExpense
);

// 📋 Get Expenses
router.get(
    "/",
    auth,
    getExpenses
);

// ✏️ Update Expense
router.put(
    "/:id",
    auth,
    updateExpense
);

// ❌ Delete Expense
router.delete(
    "/:id",
    auth,
    deleteExpense
);

module.exports = router;