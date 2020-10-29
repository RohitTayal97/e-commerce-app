const express = require("express");
const app = express();
const fs = require("fs");
const mongoose = require("mongoose");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").load();
}

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("connected to MongoDB"));

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));

app.get("/store", function (req, res) {
  fs.readFile("items.json", function (error, data) {
    if (error) {
      res.status(500).end();
    } else {
      res.render("store.ejs", {
        items: JSON.parse(data),
      });
    }
  });
});

const userRouter = require("./routes/user");
app.use("/user", userRouter);

app.listen(3000, () => {
  console.log("server started");
});

module.exports = {
  PAYSAFE_ENCODED_PUBLIC_KEY: process.env.PAYSAFE_ENCODED_PUBLIC_KEY,
  PAYSAFE_ENCODED_PRIVATE_KEY: process.env.PAYSAFE_ENCODED_PRIVATE_KEY,
};
