const mongoose = require("mongoose");
const Property = require("../models/Property");

// ===============================
// GET ALL PROPERTIES
// ===============================

const getProperties = async (req, res) => {
  try {
    const {
      purpose,
      propertyType,
      city,
      area,
      bedrooms,
      bathrooms,
      status,
      featured,
      page = 1,
      limit = 12,
      sort = "newest",
    } = req.query;

    // ==========================
    // BUILD FILTER
    // ==========================

    const filter = {};

    if (purpose) {
      filter.purpose = purpose;
    }

    if (propertyType) {
      filter.propertyType = propertyType;
    }

    if (city) {
      filter["location.city"] = city;
    }

    if (area) {
      filter["location.area"] = area;
    }

    if (bedrooms) {
      filter.bedrooms = Number(bedrooms);
    }

    if (bathrooms) {
      filter.bathrooms = Number(bathrooms);
    }

    if (status) {
      filter.status = status;
    }

    if (featured !== undefined) {
      filter.featured = featured === "true";
    }

    // ==========================
    // PAGINATION
    // ==========================

    const currentPage = Math.max(Number(page) || 1, 1);

    const itemsPerPage = Math.min(Math.max(Number(limit) || 12, 1), 100);

    const skip = (currentPage - 1) * itemsPerPage;

    // ==========================
    // SORTING
    // ==========================

    let sortOption = {};

    switch (sort) {
      case "price_asc":
        sortOption = { price: 1 };
        break;

      case "price_desc":
        sortOption = { price: -1 };
        break;

      case "oldest":
        sortOption = { createdAt: 1 };
        break;

      case "views":
        sortOption = { views: -1 };
        break;

      case "newest":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // ==========================
    // QUERY
    // ==========================

    const total = await Property.countDocuments(filter);

    const properties = await Property.find(filter)
      .populate("agent", "firstName lastName email profileImage")
      .sort(sortOption)
      .skip(skip)
      .limit(itemsPerPage)
      .lean();

    // ==========================
    // PAGINATION INFO
    // ==========================

    const totalPages = Math.ceil(total / itemsPerPage);

    res.status(200).json({
      success: true,

      count: properties.length,

      total,

      page: currentPage,

      limit: itemsPerPage,

      pages: totalPages,

      hasNextPage: currentPage < totalPages,

      hasPrevPage: currentPage > 1,

      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET SINGLE PROPERTY
// ===============================

const getProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(id).populate(
      "agent",
      "firstName lastName email profileImage"
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// CREATE PROPERTY
// ===============================

const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      propertyType,
      purpose,
      price,
      currency,
      bedrooms,
      bathrooms,
      area,
      areaUnit,
      location,
      images,
      amenities,
      agent,
      status,
      featured,
    } = req.body;

    if (
      !title ||
      !description ||
      !propertyType ||
      !purpose ||
      price === undefined ||
      area === undefined ||
      !location?.city ||
      !location?.area ||
      !agent
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required property fields",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(agent)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent ID",
      });
    }

    const property = await Property.create({
      title,
      description,
      propertyType,
      purpose,
      price,
      currency,
      bedrooms,
      bathrooms,
      area,
      areaUnit,
      location,
      images,
      amenities,
      agent,
      status,
      featured,
    });

    const populatedProperty = await property.populate(
      "agent",
      "firstName lastName email profileImage"
    );

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property: populatedProperty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// UPDATE PROPERTY
// ===============================

const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "propertyType",
      "purpose",
      "price",
      "currency",
      "bedrooms",
      "bathrooms",
      "area",
      "areaUnit",
      "location",
      "images",
      "amenities",
      "status",
      "featured",
      "approved",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        property[field] = req.body[field];
      }
    });

    await property.save();

    const updatedProperty = await Property.findById(id).populate(
      "agent",
      "firstName lastName email profileImage"
    );

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// DELETE PROPERTY
// ===============================

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
};
