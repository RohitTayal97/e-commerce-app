const express = require("express");
const router = express.Router();
const axios = require('axios');

router.post("/", (req, res) => {
  const reqObj = {
    merchantRefNum: `${new Date().getTime()}`,
    paymentTypes: ["CARD"],
  };

  const reqConfig = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': "Basic " + process.env.PAYSAFE_ENCODED_PRIVATE_KEY
    }
  };

  axios.post(
    "https://private-anon-c0cddbe85f-paysafeapipaymenthubv1.apiary-mock.com/paymenthub/v1/customers/" +
      req.body.customerId + "/singleusecustomertokens",
    reqObj,
    reqConfig
  )
  .then(response => {
    res.send({
      singleUseCustomerToken: response.data.singleUseCustomerToken
    });
  })
  .catch(error => {
    res.status(400).send("error occured!");
  })
});

module.exports = router;
