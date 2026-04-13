const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const connectionHost = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      "MongoDB Connected:",
      connectionHost.connection.host
    );

  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = { connectDb };