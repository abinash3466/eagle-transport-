const mongoose = require("mongoose");
const Expense = require("../models/Expense");

const ALLOWED_TYPES = ["Driver Salary", "Fuel", "Service", "Toll", "Other"];

const pickExpenseFields = (body = {}) => {
  const payload = {};

  if (body.title !== undefined) payload.title = String(body.title).trim();
  if (body.amount !== undefined) payload.amount = Number(body.amount);
  if (body.type !== undefined) payload.type = body.type;
  if (body.driver !== undefined) payload.driver = body.driver || null;

  return payload;
};

const validateExpense = (payload, { partial = false } = {}) => {
  if (!partial || payload.title !== undefined) {
    if (!payload.title) return "Expense title is required";
  }

  if (!partial || payload.amount !== undefined) {
    if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
      return "Expense amount must be greater than 0";
    }
  }

  if (payload.type !== undefined && !ALLOWED_TYPES.includes(payload.type)) {
    return "Invalid expense type";
  }

  if (
    payload.driver &&
    !mongoose.Types.ObjectId.isValid(String(payload.driver))
  ) {
    return "Invalid driver id";
  }

  return null;
};

// ➕ Add Expense
exports.addExpense = async (req, res) => {
  try {
    const payload = pickExpenseFields(req.body);
    const validationError = validateExpense(payload);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const expense = await Expense.create(payload);

    return res.status(201).json({
      success: true,
      expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 📋 Get Expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate("driver", "name driverId")
      .sort({ createdAt: -1 });

    return res.json(expenses);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✏️ Update Expense
exports.updateExpense = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense id",
      });
    }

    const payload = pickExpenseFields(req.body);
    const validationError = validateExpense(payload, { partial: true });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.json({
      success: true,
      expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ❌ Delete Expense
exports.deleteExpense = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense id",
      });
    }

    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
