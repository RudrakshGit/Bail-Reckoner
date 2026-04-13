require("dotenv").config();
const mongoose = require("mongoose");
const LegalSection = require("./models/LegalSection");
const data = require("./data/legalSections.json");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await LegalSection.deleteMany(); // optional: clears old data
    await LegalSection.insertMany(data);

    console.log("Legal sections seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();