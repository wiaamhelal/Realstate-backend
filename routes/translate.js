const express = require("express");
const translate = require("google-translate-api-x");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    if (!text || !targetLang)
      return res.status(400).json({ error: "Missing parameters" });

    const result = await translate(text, { to: targetLang });
    res.json({ translatedText: result.text });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Translation failed", details: error.message });
  }
});

module.exports = router;
