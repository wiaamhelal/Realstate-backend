const express = require("express");

const {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
} = require("../controllers/favoriteController");

const router = express.Router();

// Temporary assumption:
// req.user is already available from authentication middleware.

router.get("/", getFavorites);

router.get("/:propertyId", checkFavorite);

router.post("/:propertyId", addFavorite);

router.delete("/:propertyId", removeFavorite);

module.exports = router;
