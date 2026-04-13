const express = require("express");
const router = express.Router();
const {
  createUndertrial,
  getUndertrialById
} = require("../controllers/undertrialController");

router.post("/create", createUndertrial);
router.get("/:id", getUndertrialById);

module.exports = router;