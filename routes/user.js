const express = require("express");
const router = express.Router();
let multer = require("multer");
let upload = multer();
const User = require("../models/users");

router.post("/", upload.none(), async (req, res) => {
  User.findOne({ email: req.body.email }, async (err, user) => {
    if (!user) {
      const year = req.body.dateOfBirth.substr(0, 4);
      const month = req.body.dateOfBirth.substr(5, 2);
      const day = req.body.dateOfBirth.substr(8);

      const userObj = new User({
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
        user = await userObj.save();
      } catch (err) {
        res.send(err);
      }
    }

    if (user.customer_id) {
      res.json({
        merchantCustomerId: user._id,
        customerId: user.customer_id,
      });
    } else {
      res.json({ merchantCustomerId: user._id });
    }
  });
});

module.exports = router;
