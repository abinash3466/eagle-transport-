const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        type: {
            type: String,
            enum: [
                "Driver Salary",
                "Fuel",
                "Service",
                "Toll",
                "Other",
            ],

            default: "Other",
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },
    }
);

module.exports =
    mongoose.model(
        "Expense",
        expenseSchema
    );