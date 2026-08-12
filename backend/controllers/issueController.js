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
// ✅ RESOLVE ISSUE / COMPLETE SERVICE
exports.resolveIssue = async (req, res) => {
  try {
    const {
      workshop = "",
      amount = 0,
      mechanic = "",
      notes = "",
      invoiceNumber = "",
      resolvedAt,
      nextServiceDate,
    } = req.body || {};

    const serviceAmount = Number(amount);

    if (!Number.isFinite(serviceAmount) || serviceAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Service amount must be 0 or greater",
      });
    }

    const issue = await IssueReport.findByIdAndUpdate(
      req.params.id,
      {
        status: "Resolved",
        serviceDetails: {
          workshop: String(workshop).trim(),
          amount: serviceAmount,
          mechanic: String(mechanic).trim(),
          notes: String(notes).trim(),
          invoiceNumber: String(invoiceNumber).trim(),
          resolvedAt: resolvedAt ? new Date(resolvedAt) : new Date(),
          nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : undefined,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("truck")
      .populate("driver");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    return res.json({
      success: true,
      message: "Issue resolved successfully",
      issue,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
