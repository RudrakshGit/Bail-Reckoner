const Undertrial = require("../models/Undertrial");

exports.createUndertrial = async (req, res, next) => {
  try {
    const {
      name,
      prisonerId,
      sections,
      timeServedYears,
      previousCriminalRecords = 0,
      riskProfile
    } = req.body;

    if (!name || !prisonerId) {
      return res.status(400).json({ message: "name and prisonerId are required" });
    }

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ message: "sections array is required" });
    }

    if (typeof timeServedYears !== "number" || Number.isNaN(timeServedYears) || timeServedYears < 0) {
      return res.status(400).json({ message: "timeServedYears must be a non-negative number" });
    }

    if (typeof previousCriminalRecords !== "number" || Number.isNaN(previousCriminalRecords) || previousCriminalRecords < 0) {
      return res.status(400).json({ message: "previousCriminalRecords must be a non-negative number" });
    }

    const flightRisk = riskProfile?.flightRisk ?? 0;
    const witnessRisk = riskProfile?.witnessRisk ?? 0;

    if (typeof flightRisk !== "number" || Number.isNaN(flightRisk) ||
        typeof witnessRisk !== "number" || Number.isNaN(witnessRisk)) {
      return res.status(400).json({ message: "Risk scores must be valid numbers" });
    }

    if (flightRisk < 0 || witnessRisk < 0 || flightRisk > 10 || witnessRisk > 10) {
      return res.status(400).json({ message: "Risk scores must be between 0 and 10" });
    }

    const undertrial = await Undertrial.create({
      name,
      prisonerId,
      sections,
      timeServedYears,
      previousCriminalRecords,
      riskProfile: {
        flightRisk,
        witnessRisk
      }
    });
    res.status(201).json(undertrial);
  } catch (error) {
    next(error);
  }
};

exports.getUndertrialById = async (req, res, next) => {
  try {
    const undertrial = await Undertrial.findById(req.params.id);
    if (!undertrial) {
      return res.status(404).json({ message: "Undertrial not found" });
    }
    res.json(undertrial);
  } catch (error) {
    next(error);
  }
};