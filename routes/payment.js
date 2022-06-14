const express = require("express");
const router = express.Router();
const User = require("../models/users");
const axios = require('axios');

router.post("/", async (req, res) => {
  const reqObj = {
    merchantRefNum: `${new Date().getTime()}`,
    amount: req.body.amount,
    currencyCode: "USD",
    ...(req.body.customerOperation == "ADD" &&
      (req.body.customerId
        ? { customerId: req.body.customerId }
        : { merchantCustomerId: req.body.merchantCustomerId })),
    settleWithAuth: true,
    paymentHandleToken: req.body.paymentHandleToken,
    description: "Payment at Green Day Store",
  };

  const reqConfig = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': "Basic " + process.env.PAYSAFE_ENCODED_PRIVATE_KEY
    }
  };

  axios.post(
    "https://private-anon-9c89a5b412-paysafeapipaymenthubv1.apiary-mock.com/paymenthub/v1/payments", 
    reqObj,
    reqConfig
  )
  .then(response => {
    if (response.data.availableToSettle != 0) {
      res.send("Success");
      if (response.data.id && !req.body.customerId) {
        User.updateOne(
          { _id: req.body.merchantCustomerId },
          { customer_id: response.data.id },
          function (err, docs) {
            if (err) {
              console.log(err);
            }
          }
        );
      }
    } else {
      res.send("Insufficient Funds!");
    }
  })
  .catch(error => {
    res.status(400).send("error occured!");
  })
});

module.exports = router;
