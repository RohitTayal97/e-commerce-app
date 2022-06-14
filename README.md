# E-Commerce-App with Paysafe payment integration

- Add .env file containing PAYSAFE_ENCODED_PRIVATE_KEY(for Paysafe APIs) and DATABASE_URL(for your MongoDB server).
- run `npm i && npm start`.
- Open http://localhost:3000 on your browser.
- Voila your app is running.

## Deployed at

https://thegreenday.glitch.me/

> **_NOTE:_** the hosting service due to being free, only wakes the application on visiting. So, it takes a minute to wake up.

## About

- E-Commerce App with payment as well as card details saving(optional) functionality.

- Used Paysafe APIs and SDK

  - Payments API
    https://developer.paysafe.com/en/payments/api/#/reference/payments/payments/process-payment

  - Customers API
    https://developer.paysafe.com/en/payments/api/#/reference/customers/single-use-tokens/create-a-single-use-customer-token

  - Paysafe Payments Checkout SDK
    https://developer.paysafe.com/en/payments/api/#/introduction/payments-checkout/how-to-use-the-sdk

- Used MongoDB as DB server and Mongoose for building models.
- Used EJS(https://ejs.co) for building Frontend and ExpressJS for creating backend.
- Used Glitch(https://glitch.com/) for deployment.
