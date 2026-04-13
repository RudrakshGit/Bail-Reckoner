const express = require("express");
const router = express.Router();

const {
  evaluateBail,
  evaluateUndertrialBail
} = require("../controllers/bailController");

const { listLegalSections } = require("../controllers/legalSectionController");

router.post("/evaluate", evaluateBail);
router.post("/evaluate-undertrial/:id", evaluateUndertrialBail);
router.get("/legal-sections", listLegalSections);

module.exports = router;