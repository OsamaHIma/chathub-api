const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/users");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use("/api/auth", userRoutes);
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Server Connected Successfully");
  })
  .catch((err) => {
    console.error("Server Connection Error:", err);
   
  });

const server = app.listen(process.env.PORT, () => {
  console.log(`Server Running on: ${process.env.PORT} `);
});
