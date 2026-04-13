const Undertrial = require("../models/Undertrial");

exports.createUndertrial = async (req, res) => {
  try {
    const {
      name,
      prisonerId,
      sections,
      timeServedYears,
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
      riskProfile: {
        flightRisk,
        witnessRisk
      }
    });
    res.status(201).json(undertrial);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid undertrial data", details: error.message });
    }
    res.status(500).json({ message: "Error creating undertrial" });
  }
};

exports.getUndertrialById = async (req, res) => {
  try {
    const undertrial = await Undertrial.findById(req.params.id);
    if (!undertrial) {
      return res.status(404).json({ message: "Undertrial not found" });
    }
    res.json(undertrial);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid undertrial id" });
    }
    res.status(500).json({ message: "Error fetching undertrial" });
  }
};