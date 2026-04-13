const mongoose = require("mongoose");

const legalSectionSchema = new mongoose.Schema({
  sectionNumber: { type: String, required: true },
  act: { 
    type: String, 
    required: true 
    // Examples: IPC, BNS, SCST Act, POCSO Act, IT Act
  },

  offenceName: { type: String, required: true },
  description: { type: String },

  category: {
    type: String,
    required: true
    // Examples:
    // "CYBER_CRIME"
    // "CRIME_AGAINST_WOMEN"
    // "CRIME_AGAINST_CHILDREN"
    // "SC_ST_OFFENCE"
    // "ECONOMIC_OFFENCE"
    // "OFFENCE_AGAINST_STATE"
    // "GENERAL"
  },

  maxPunishmentYears: { type: Number, required: true },
  bailable: { type: Boolean, required: true },
  compoundable: { type: Boolean, required: true },

  requiresSurety: { type: Boolean, default: true },
  allowsPersonalBond: { type: Boolean, default: false },
  fineApplicable: { type: Boolean, default: false }

}, { timestamps: true });

legalSectionSchema.index({ sectionNumber: 1, act: 1 }, { unique: true });

module.exports = mongoose.model("LegalSection", legalSectionSchema);