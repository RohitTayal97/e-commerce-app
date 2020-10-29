const express = require("express");
const router = express.Router();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

router.post("/", (req, res) => {
  var request = new XMLHttpRequest();
  request.open(
    "POST",
    "https://private-anon-8467725ed3-paysafeapipaymenthubv1.apiary-proxy.com/paymenthub/v1/customers/" +
      req.body.customerId +
      "/singleusecustomertokens",
    true
  );
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader(
    "Authorization",
    "Basic " + process.env.PAYSAFE_ENCODED_PRIVATE_KEY
  );

  request.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 201) {
      res.json({
        singleUseCustomerToken: JSON.parse(request.responseText)
          .singleUseCustomerToken,
      });
    }
  };

  request.send(
    JSON.stringify({
      merchantRefNum: new Date().getTime(),
      paymentTypes: ["CARD"],
    })
  );
});

module.exports = router;
