const mongoose = require("mongoose");

const Favorite = require("../models/Favorite");
const Property = require("../models/Property");

// ADD PROPERTY TO FAVORITES
const addFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const existingFavorite = await Favorite.findOne({
      user: userId,
      property: propertyId,
    });

    if (existingFavorite) {
      return res.status(409).json({
        success: false,
        message: "Property is already in favorites",
      });
    }

    const favorite = await Favorite.create({
      user: userId,
      property: propertyId,
    });

    res.status(201).json({
      success: true,
      message: "Property added to favorites",
      favorite,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REMOVE PROPERTY FROM FAVORITES
const removeFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const favorite = await Favorite.findOneAndDelete({
      user: userId,
      property: propertyId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Property is not in favorites",
      });
    }

    res.status(200).json({
      success: true,
      message: "Property removed from favorites",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET USER FAVORITES
const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const { page = 1, limit = 12 } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);

    const itemsPerPage = Math.min(Math.max(Number(limit) || 12, 1), 100);

    const skip = (currentPage - 1) * itemsPerPage;

    const filter = {
      user: userId,
    };

    const total = await Favorite.countDocuments(filter);

    const favorites = await Favorite.find(filter)
      .populate({
        path: "property",
        populate: {
          path: "agent",
          select: "firstName lastName email profileImage",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(itemsPerPage)
      .lean();

    const totalPages = Math.ceil(total / itemsPerPage);

    res.status(200).json({
      success: true,
      data: {
        favorites,
        pagination: {
          total,
          count: favorites.length,
          page: currentPage,
          limit: itemsPerPage,
          pages: totalPages,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CHECK IF PROPERTY IS FAVORITED
const checkFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const favorite = await Favorite.exists({
      user: userId,
      property: propertyId,
    });

    res.status(200).json({
      success: true,
      isFavorite: Boolean(favorite),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
};
