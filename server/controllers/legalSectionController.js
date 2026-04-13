const LegalSection = require("../models/LegalSection");

exports.listLegalSections = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();

    const filter = q
      ? { sectionNumber: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
      : {};

    const items = await LegalSection.find(filter)
      .select("sectionNumber act offenceName")
      .sort({ act: 1, sectionNumber: 1 })
      .limit(200)
      .lean();

    res.json(
      items.map((x) => ({
        sectionNumber: x.sectionNumber,
        act: x.act,
        offenceName: x.offenceName,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

