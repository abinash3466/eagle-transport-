const FuelLog = require("../models/FuelLog");


// ➕ CREATE FUEL LOG
exports.createFuelLog = async (
    req,
    res
) => {

    try {

        const fuelLog =
            await FuelLog.create(req.body);

        res.status(201).json({
            success: true,
            fuelLog,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// 📋 GET FUEL LOGS
exports.getFuelLogs = async (
    req,
    res
) => {

    try {

        const fuelLogs =
            await FuelLog.find()
                .populate("truck")
                .populate("driver")
                .sort({
                    createdAt: -1,
                });

        res.json(fuelLogs);

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ✏️ UPDATE FUEL LOG
exports.updateFuelLog = async (
    req,
    res
) => {

    try {

        const fuelLog =
            await FuelLog.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                }
            );

        res.json({
            success: true,
            fuelLog,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ❌ DELETE FUEL LOG
exports.deleteFuelLog = async (
    req,
    res
) => {

    try {

        await FuelLog.findByIdAndDelete(
            req.params.id
        );

        res.json({
            success: true,
            message:
                "Fuel log deleted",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};