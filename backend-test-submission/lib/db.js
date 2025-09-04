const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://admin:admin@cluster0.cx6t4.mongodb.net/affordmed";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(' MongoDB connected successfully');
    console.log(` Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(' MongoDB connection failed:', error);
    throw error;
  }
};

module.exports = { connectDB };