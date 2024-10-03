const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { setGlobalOptions } = require("firebase-functions/v2");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_KEY);

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

setGlobalOptions({ maxInstances: 10 });

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Success",
  });
});

// Payment Route
app.post("/payment/create", async (req, res) => {
  const total = parseInt(req.query.total);

  if (total > 0) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: "usd",
      });
      console.log(paymentIntent);

      // Send the payment intent details back to the client
      res.status(201).json({
        message: "Payment Intent created successfully",
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({
        message: "Payment creation failed",
        error: error.message,
      });
    }
  } else {
    res.status(400).json({
      message: "Invalid payment amount",
    });
  }
});

// Export the API for Firebase Functions
exports.api = onRequest(app);

// For local testing
app.listen(5000, (err) => {
  if (err) throw err;
  console.log("Amazon server running on PORT: 5000, http://localhost:5000");
});
