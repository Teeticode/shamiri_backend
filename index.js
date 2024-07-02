const express = require("express");
const dotenv = require("dotenv");
const connectToDb = require("./config/mongo");
const mongoose = require("mongoose");
const morgan = require("morgan");
const userRoutes = require("./routes/userRoutes");
const categoryRouter = require("./routes/categoryRouter");
const journalRouter = require("./routes/journalRouter");

const cookieParser = require("cookie-parser");
const path = require("path");
const { dirname } = require("path");
const cors = require("cors");

let corsOption = {
  origin: ["http://localhost:3000", "http://localhost:5173"],
};
dotenv.config();
const app = express();
const PORT = process.env.PORT;
const url = process.env.URL;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOption));
app.use(cookieParser());
app.options("*", cors());
app.use(morgan("tiny"));
app.use(express.static(path.join(__dirname, "Images")));
app.use(`${url}+users`, userRoutes);
app.use(`${url}+categories`, categoryRouter);
app.use(`${url}+journals`, journalRouter);

connectToDb();
app.get(`${url}`, (req, res) => {
  res.status(200).json({ message: "Open Tech Task" });
});
app.listen(PORT, () => {
  console.log(`open tech server is running on PORT ${PORT}`);
});
