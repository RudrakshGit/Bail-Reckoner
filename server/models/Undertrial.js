const mongoose = require("mongoose");

const undertrialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  prisonerId: { type: String, required: true },
  sections: [{ type: String, required: true }],
  timeServedYears: { type: Number, required: true },
  previousCriminalRecords: { type: Number, default: 0 },

  riskProfile: {
    flightRisk: { type: Number, default: 0 },
    witnessRisk: { type: Number, default: 0 }
  },

  lastEvaluation: {
    eligible: Boolean,
    reason: String,
    evaluatedAt: Date
  }

}, { timestamps: true });

undertrialSchema.index({ prisonerId: 1 }, { unique: true });

module.exports = mongoose.model("Undertrial", undertrialSchema);