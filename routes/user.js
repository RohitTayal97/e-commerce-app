const express = require("express");
const router = express.Router();
var multer = require("multer");
var upload = multer();
const User = require("../models/users");

router.post("/", upload.none(), async (req, res) => {
  User.findOne({ email: req.body.email }, async (err, existingUser) => {
    if (existingUser) {
      if (existingUser.customer_id) {
        res.json({
          new: false,
          merchantCustomerId: existingUser._id,
          customerId: existingUser.customer_id,
        });
      } else {
        res.json({ new: false, merchantCustomerId: existingUser._id });
      }
    } else {
      const year = req.body.dateOfBirth.substr(0, 4);
      const month = req.body.dateOfBirth.substr(5, 2);
      const day = req.body.dateOfBirth.substr(8);

      const user = new User({
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        day_of_birth: day,
        month_of_birth: month,
        year_of_birth: year,
        email: req.body.email,
        street: req.body.street,
        city: req.body.city,
        zip: req.body.zip,
        state: req.body.state,
        country: req.body.country,
      });

      try {
        const newUser = await user.save();
        res.json({ new: true, merchantCustomerId: newUser._id });
      } catch (err) {
        res.send(err);
      }
    }
  });
});

router.post("/addCustId", async (req, res) => {
  User.updateOne(
    { _id: req.body._id },
    {
      customer_id: req.body.customerId,
    },
    function (err, docs) {
      if (err) {
        res.send(err);
      } else {
        res.send("Success");
      }
    }
  );
});

module.exports = router;
