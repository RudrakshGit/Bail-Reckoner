require("dotenv").config();

/* -------------------- Env validation -------------------- */
if (!process.env.MONGO_URI) {
  console.error("FATAL: MONGO_URI environment variable is not set. Exiting.");
  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const undertrialRoutes = require("./routes/undertrialRoutes");
const { connectDb } = require("./config/db");
const bailRoutes = require("./routes/bailRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

/* -------------------- Middleware -------------------- */

// CORS: restrict to known frontend origins
const allowedOrigins = (process.env.ALLOWED_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Allow requests with no origin (server-to-server, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

// Rate limiting
const rateLimit = require("express-rate-limit");
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // 100 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
  })
);

/* -------------------- Database -------------------- */
connectDb();

/* -------------------- Routes -------------------- */
app.get("/", (req, res) => {
  res.send("Bail Reckoner API Running");
});

app.use("/api/bail", bailRoutes);
app.use("/api/undertrial", undertrialRoutes);

/* -------------------- Global Error Handler -------------------- */
app.use(errorHandler);

module.exports = app;

/* -------------------- Server (local only) -------------------- */
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}