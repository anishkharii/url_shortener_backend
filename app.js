const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const router = require("./Routes/routes");
require("dotenv").config();

const app = express();
app.use("/public", express.static("public"));
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected to MongoDB");
});

app.use("/", router);

app.listen(3000, () => {
  console.log("Connected to server.");
});
