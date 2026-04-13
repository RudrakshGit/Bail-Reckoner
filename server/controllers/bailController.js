const LegalSection = require("../models/LegalSection");
const Undertrial = require("../models/Undertrial");

const performEvaluation = async ({
  sections,
  timeServedYears,
  flightRisk = 0,
  witnessRisk = 0
}) => {

  const legalData = await LegalSection.find({
    sectionNumber: { $in: sections }
  });

  if (legalData.length === 0) {
    throw new Error("No matching legal sections found");
  }

  let maxPunishment = 0;
  let highestSection = null;
  let allBailable = true;

  legalData.forEach(section => {
    if (section.maxPunishmentYears > maxPunishment) {
      maxPunishment = section.maxPunishmentYears;
      highestSection = section.sectionNumber;
    }

    if (!section.bailable) {
      allBailable = false;
    }
  });

  const riskScore = flightRisk + witnessRisk;
  const RISK_THRESHOLD = 7;

  let eligible = false;
  let reason = "";

  if (riskScore > RISK_THRESHOLD) {
    eligible = false;
    reason = "High judicial risk (absconding or witness influence)";
  } else if (allBailable) {
    eligible = true;
    reason = "All offences are bailable";
  } else if (timeServedYears >= maxPunishment / 2 && riskScore <= RISK_THRESHOLD) {
    eligible = true;
    reason = "Half-term served and judicial risk acceptable";
  } else {
    eligible = false;
    reason = "Half-term not completed";
  }

  // Procedural Requirements
  let proceduralRequirements = {
    requiresSurety: false,
    allowsPersonalBond: false,
    fineApplicable: false,
    identityVerificationRequired: true
  };

  legalData.forEach(section => {
    if (section.requiresSurety) proceduralRequirements.requiresSurety = true;
    if (section.allowsPersonalBond) proceduralRequirements.allowsPersonalBond = true;
    if (section.fineApplicable) proceduralRequirements.fineApplicable = true;
  });

  const sectionDetails = legalData.map(section => ({
    sectionNumber: section.sectionNumber,
    act: section.act,
    category: section.category,
    offenceName: section.offenceName
  }));

  return {
    eligible,
    reason,
    sectionsEvaluated: sectionDetails,
    highestPunishmentSection: highestSection,
    maxPunishmentYears: maxPunishment,
    halfTerm: maxPunishment / 2,
    timeServedYears,
    riskScore,
    proceduralRequirements
  };
};

exports.evaluateBail = async (req, res) => {

  const {
    sections,
    timeServedYears,
    flightRisk = 0,
    witnessRisk = 0
  } = req.body;

  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return res.status(400).json({ message: "sections array is required" });
  }

  if (typeof timeServedYears !== "number" || Number.isNaN(timeServedYears)) {
    return res.status(400).json({ message: "timeServedYears must be a valid number" });
  }

  if (timeServedYears < 0) {
    return res.status(400).json({ message: "timeServedYears cannot be negative" });
  }

  if (typeof flightRisk !== "number" || Number.isNaN(flightRisk)) {
    return res.status(400).json({ message: "flightRisk must be a valid number" });
  }

  if (typeof witnessRisk !== "number" || Number.isNaN(witnessRisk)) {
    return res.status(400).json({ message: "witnessRisk must be a valid number" });
  }

  if (flightRisk < 0 || witnessRisk < 0) {
    return res.status(400).json({ message: "Risk scores cannot be negative" });
  }

  if (flightRisk > 10 || witnessRisk > 10) {
    return res.status(400).json({ message: "Risk scores must be between 0 and 10" });
  }

  try {
    const result = await performEvaluation({
      sections,
      timeServedYears,
      flightRisk,
      witnessRisk
    });

    res.status(200).json(result);

  } catch (error) {
    if (error.message === "No matching legal sections found") {
      return res.status(404).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.evaluateUndertrialBail = async (req, res) => {

  try {
    const undertrial = await Undertrial.findById(req.params.id);

    if (!undertrial) {
      return res.status(404).json({ message: "Undertrial not found" });
    }

    const result = await performEvaluation({
      sections: undertrial.sections,
      timeServedYears: undertrial.timeServedYears,
      flightRisk: undertrial.riskProfile.flightRisk,
      witnessRisk: undertrial.riskProfile.witnessRisk
    });

    undertrial.lastEvaluation = {
      eligible: result.eligible,
      reason: result.reason,
      evaluatedAt: new Date()
    };

    await undertrial.save();

    res.json({
      undertrial,
      evaluation: result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};