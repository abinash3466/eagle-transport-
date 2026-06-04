const Expense = require("../models/Expense");

// ➕ Add Expense
exports.addExpense = async (req, res) => {
    try {
        const expense = new Expense(req.body);

        await expense.save();

        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
};

// 📋 Get Expenses
exports.getExpenses = async (req, res) => {
    try {
        const expenses =
            await Expense.find()
                .sort({ createdAt: -1 });

        res.json(expenses);
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
};

// ✏️ Update Expense
exports.updateExpense = async (
    req,
    res
) => {
    try {
        const expense =
            await Expense.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    returnDocument: "after",
                }
            );

        res.json(expense);
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
};

// ❌ Delete Expense
exports.deleteExpense = async (
    req,
    res
) => {
    try {
        await Expense.findByIdAndDelete(
            req.params.id
        );

        res.json({
            success: true,
            message:
                "Expense deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
};