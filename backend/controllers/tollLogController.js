const TollLog = require("../models/TollLog");


// ➕ CREATE TOLL LOG
exports.createTollLog = async (
    req,
    res
) => {

    try {

        const tollLog =
            await TollLog.create(req.body);

        res.status(201).json({
            success: true,
            tollLog,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// 📋 GET TOLL LOGS
exports.getTollLogs = async (
    req,
    res
) => {

    try {

        const tollLogs =
            await TollLog.find()
                .populate("truck")
                .populate("driver")
                .sort({
                    createdAt: -1,
                });

        res.json(tollLogs);

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ✏️ UPDATE TOLL LOG
exports.updateTollLog = async (
    req,
    res
) => {

    try {

        const tollLog =
            await TollLog.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                }
            );

        res.json({
            success: true,
            tollLog,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ❌ DELETE TOLL LOG
exports.deleteTollLog = async (
    req,
    res
) => {

    try {

        await TollLog.findByIdAndDelete(
            req.params.id
        );

        res.json({
            success: true,
            message:
                "Toll log deleted",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};