const mongoose = require('mongoose');

const issueReportSchema = new mongoose.Schema(
  {
    issueType: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: '',
    },

    severity: {
      type: String,
      default: 'Medium',
    },

    location: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      default: 'Open',
    },

    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Truck',
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },

    serviceDetails: {
      workshop: String,
      amount: Number,
      mechanic: String,
      notes: String,
      invoiceNumber: String,
      resolvedAt: Date,
      nextServiceDate: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'IssueReport',
  issueReportSchema
);