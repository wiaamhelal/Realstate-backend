const express = require("express");
const connectToDb = require("./config/connectToDb");
const requistsSender = require("./config/requistsSender");
const { notFound, errorHandler } = require("./models/error");
const cors = require("cors");
require("dotenv").config();
const xss = require("xss-clean");
const ratelimiting = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const path = require("path");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

connectToDb();

app.use(express.json());

app.use(xss());

app.use(helmet());

app.use(hpp());

app.use(cors({ origin: true }));

app.use("/api/auth", require("./routes/authRoute"));
// app.use("/api/users", require("./routes/usersRoute"));
app.use("/api/password", require("./routes/passwordRoute"));
app.use("/api/properties", require("./routes/propertyRoute"));
app.use("/api/favorites", require("./routes/favoriteRoute"));

// ✅ Stripe payment route (هنا)
app.post("/payments/create", async (req, res) => {
  try {
    const total = Number(req.query.total);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "aed",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe error:", error.message);
    res.status(500).json({ error: error.message });
  }
});
// app.use(express.static("../front/build"));

// app.get("*", (req, res) => {
//   res.sendFile(`${__dirname}../front/build/index.html`);
// });

// error handler middleware
app.use(notFound);
app.use(errorHandler);

const https = require("https");

setInterval(() => {
  https
    .get("https://back-end-store-9vu0.onrender.com", (res) => {
      console.log(`Status Code: ${res.statusCode}`);
    })
    .on("error", (err) => {
      console.error(`Error: ${err.message}`);
    });
}, 600000); // Ping every 10 minutes

// translate the website
const translate = require("google-translate-api-x");

const translateRoutes = require("./routes/translate");
const router = require("./routes/authRoute");
app.use("/api/translate", translateRoutes);

app.post("/api/translate", async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    if (!text || !targetLang)
      return res.status(400).json({ error: "Missing parameters" });

    const result = await translate(text, { to: targetLang });
    res.json({ translatedText: result.text });
  } catch (error) {
    console.error("Translation error:", error);
    res
      .status(500)
      .json({ error: "Translation failed", details: error.message });
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log("port is running 8000"));
