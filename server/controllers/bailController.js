const LegalSection = require("../models/LegalSection");
const Undertrial = require("../models/Undertrial");

const performEvaluation = async ({
  sections,
  timeServedYears,
  flightRisk = 0,
  witnessRisk = 0,
  previousCriminalRecords = 0
}) => {

  const legalData = await LegalSection.find({
    sectionNumber: { $in: sections }
  });

  if (legalData.length === 0) {
    throw new Error("No matching legal sections found");
  }

  const isLifeOrDeathSection = (section) => {
    const text = `${section.offenceName || ""} ${section.description || ""}`.toLowerCase();
    return (
      section.deathPenaltyPossible === true ||
      section.lifeImprisonmentPossible === true ||
      text.includes("death") ||
      text.includes("imprisonment for life") ||
      text.includes("life imprisonment")
    );
  };

  let maxPunishment = 0;
  let highestSection = null;
  let highestSectionHasLifeOrDeath = false;

  legalData.forEach((section) => {
    const sectionIsLifeOrDeath = isLifeOrDeathSection(section);
    if (sectionIsLifeOrDeath && !highestSectionHasLifeOrDeath) {
      highestSection = section.sectionNumber;
      highestSectionHasLifeOrDeath = true;
      return;
    }
    if (!sectionIsLifeOrDeath && !highestSectionHasLifeOrDeath && section.maxPunishmentYears > maxPunishment) {
      maxPunishment = section.maxPunishmentYears;
      highestSection = section.sectionNumber;
    }
  });

  const nonBailableSections = legalData.filter((section) => !section.bailable);
  const nonBailableOffenceNames = nonBailableSections.map((section) => section.offenceName);
  const hasSeverePunishment = nonBailableSections.some((section) => isLifeOrDeathSection(section));

  const priorRecordRisk = Math.min(previousCriminalRecords * 2, 6);
  const riskScore = flightRisk + witnessRisk + priorRecordRisk;
  const RISK_THRESHOLD = 7;

  let eligible = false;
  let reason = "";

  if (nonBailableSections.length > 0) {
    const offences = nonBailableOffenceNames.join(", ");
    const isPlural = nonBailableSections.length > 1;
    reason = `The ${isPlural ? "offences" : "offence"} "${offences}" ${isPlural ? "are" : "is"} non bailable and the decision rests solely with the Judicial Magistrate/Judge.`;
    if (hasSeverePunishment) {
      reason += " The punishment profile indicates severe offence gravity (life/death or equivalent), requiring stricter judicial scrutiny.";
    }
  } else if (riskScore > RISK_THRESHOLD) {
    eligible = false;
    reason = "High judicial risk (absconding or witness influence)";
  } else {
    eligible = true;
    reason = "All offences are bailable";
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
    offenceName: section.offenceName,
    description: section.description || ""
  }));

  return {
    eligible,
    reason,
    sectionsEvaluated: sectionDetails,
    highestPunishmentSection: highestSection,
    maxPunishmentYears: highestSectionHasLifeOrDeath ? null : maxPunishment,
    halfTerm: highestSectionHasLifeOrDeath ? null : maxPunishment / 2,
    timeServedYears,
    riskScore,
    previousCriminalRecords,
    highestSectionHasLifeOrDeath,
    judicialDiscretionRequired: nonBailableSections.length > 0,
    proceduralRequirements
  };
};

exports.evaluateBail = async (req, res) => {

  const {
    sections,
    timeServedYears,
    flightRisk = 0,
    witnessRisk = 0,
    previousCriminalRecords = 0
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

  if (
    typeof previousCriminalRecords !== "number" ||
    Number.isNaN(previousCriminalRecords) ||
    previousCriminalRecords < 0
  ) {
    return res.status(400).json({ message: "previousCriminalRecords must be a non-negative number" });
  }

  try {
    const result = await performEvaluation({
      sections,
      timeServedYears,
      flightRisk,
      witnessRisk,
      previousCriminalRecords
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
      witnessRisk: undertrial.riskProfile.witnessRisk,
      previousCriminalRecords: undertrial.previousCriminalRecords || 0
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