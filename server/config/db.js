const mongoose = require("mongoose");

const connectDb = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const connectionHost = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      "MongoDB Connected:",
      connectionHost.connection.host
    );

  } catch (error) {
    console.error("MongoDB connection error:", error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = { connectDb };