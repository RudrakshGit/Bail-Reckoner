require("dotenv").config();

const express = require("express");
const cors = require("cors");
const undertrialRoutes = require("./routes/undertrialRoutes");

const { connectDb } = require("./config/db");
const bailRoutes = require("./routes/bailRoutes");

const app = express();

/* -------------------- Middleware -------------------- */
app.use(cors());
app.use(express.json());

/* -------------------- Database -------------------- */
connectDb();

/* -------------------- Routes -------------------- */
app.get("/", (req, res) => {
  res.send("Bail Reckoner API Running");
});

app.use("/api/bail", bailRoutes);
app.use("/api/undertrial", undertrialRoutes);

module.exports = app;

/* -------------------- Server (local only) -------------------- */
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}