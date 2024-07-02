const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
mongoose.set("strictQuery", false);
const connectToDb = async () => {
  try {
    const connection = await mongoose.connect(MONGO_URI, {
      dbName: "openTech",
    });
    if (connection) {
      console.log("connected to portfolio online");
    } else {
      console.log("no connection established");
    }
  } catch (error) {
    console.error(`Error is ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectToDb;
