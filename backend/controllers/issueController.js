const IssueReport = require("../models/IssueReport");


// ➕ CREATE ISSUE
exports.createIssue = async (
    req,
    res
) => {

    try {

        const issue =
            await IssueReport.create(req.body);

        res.status(201).json({
            success: true,
            issue,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// 📋 GET ISSUES
exports.getIssues = async (
    req,
    res
) => {

    try {

        const issues =
            await IssueReport.find()
                .populate("truck")
                .populate("driver")
                .sort({
                    createdAt: -1,
                });

        res.json(issues);

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ✏️ UPDATE ISSUE
exports.updateIssue = async (
    req,
    res
) => {

    try {

        const issue =
            await IssueReport.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                }
            );

        res.json({
            success: true,
            issue,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ❌ DELETE ISSUE
exports.deleteIssue = async (
    req,
    res
) => {

    try {

        await IssueReport.findByIdAndDelete(
            req.params.id
        );

        res.json({
            success: true,
            message:
                "Issue deleted",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};