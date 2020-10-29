const express = require("express");
const router = express.Router();
const User = require("../models/users");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

router.post("/", async (req, res) => {
  var request = new XMLHttpRequest();
  request.open(
    "POST",
    "https://private-anon-8467725ed3-paysafeapipaymenthubv1.apiary-proxy.com/paymenthub/v1/payments",
    true
  );
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader(
    "Authorization",
    "Basic " + process.env.PAYSAFE_ENCODED_PRIVATE_KEY
  );
  request.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 201) {
      const resp = JSON.parse(request.responseText);
      if (resp.availableToSettle == 0) {
        res.send("Success");
        if (resp.customerId && !req.body.customerId) {
          User.updateOne(
            { _id: req.body.merchantCustomerId },
            { customer_id: resp.customerId },
            function (err, docs) {
              if (err) {
                console.log(err);
              }
            }
          );
        }
      } else {
        res.status(400).send("error occured!");
      }
    }
  };
  const reqObj = {
    merchantRefNum: new Date().getTime(),
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
  request.send(JSON.stringify(reqObj));
});

module.exports = router;
