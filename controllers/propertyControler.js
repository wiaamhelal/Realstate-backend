const mongoose = require("mongoose");
const Property = require("../models/Property");

const allowedPropertyTypes = [
  "apartment",
  "villa",
  "townhouse",
  "penthouse",
  "office",
  "shop",
  "warehouse",
  "land",
];

const allowedPurposes = ["sale", "rent"];

const allowedStatuses = ["available", "sold", "rented", "pending"];

const allowedSortOptions = [
  "newest",
  "oldest",
  "price_asc",
  "price_desc",
  "views",
];

const validateNumber = (
  value,
  fieldName,
  { min = 0, max = Infinity, integer = false } = {}
) => {
  if (value === undefined) {
    return null;
  }

  if (value.trim() === "") {
    return `${fieldName} cannot be empty`;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return `${fieldName} must be a valid number`;
  }

  if (integer && !Number.isInteger(number)) {
    return `${fieldName} must be an integer`;
  }

  if (number < min) {
    return `${fieldName} must be at least ${min}`;
  }

  if (number > max) {
    return `${fieldName} cannot exceed ${max}`;
  }

  return null;
};

// ===============================
// GET ALL PROPERTIES
// ===============================

const getProperties = async (req, res) => {
  try {
    // const {
    //   purpose,
    //   propertyType,
    //   city,
    //   area,
    //   bedrooms,
    //   bathrooms,
    //   status,
    //   featured,
    //   page = 1,
    //   limit = 12,
    //   sort = "newest",
    // } = req.query;
    const {
      purpose,
      propertyType,
      city,
      area,

      bedrooms,
      bathrooms,

      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,

      minPrice,
      maxPrice,

      minArea,
      maxArea,

      status,
      featured,
      amenities,

      page = 1,
      limit = 12,
      sort = "newest",
    } = req.query;

    // Validate enum query parameters
    if (purpose && !allowedPurposes.includes(purpose)) {
      return res.status(400).json({
        success: false,
        message: "Invalid purpose. Use sale or rent.",
      });
    }

    if (propertyType && !allowedPropertyTypes.includes(propertyType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property type.",
      });
    }

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property status.",
      });
    }

    if (!allowedSortOptions.includes(sort)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort option.",
      });
    }

    // Validate numeric parameters
    const numericFields = [
      ["minPrice", minPrice, { min: 0 }],
      ["maxPrice", maxPrice, { min: 0 }],
      ["minArea", minArea, { min: 0 }],
      ["maxArea", maxArea, { min: 0 }],
      ["bedrooms", bedrooms, { min: 0, integer: true }],
      ["bathrooms", bathrooms, { min: 0, integer: true }],
      ["minBedrooms", minBedrooms, { min: 0, integer: true }],
      ["maxBedrooms", maxBedrooms, { min: 0, integer: true }],
      ["minBathrooms", minBathrooms, { min: 0, integer: true }],
      ["maxBathrooms", maxBathrooms, { min: 0, integer: true }],
      ["page", String(page), { min: 1, integer: true }],
      ["limit", String(limit), { min: 1, max: 100, integer: true }],
    ];

    for (const [field, value, options] of numericFields) {
      const error = validateNumber(value, field, options);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error,
        });
      }
    }

    // Validate min/max ranges
    const ranges = [
      ["minPrice", minPrice, "maxPrice", maxPrice],
      ["minArea", minArea, "maxArea", maxArea],
      ["minBedrooms", minBedrooms, "maxBedrooms", maxBedrooms],
      ["minBathrooms", minBathrooms, "maxBathrooms", maxBathrooms],
    ];

    for (const [minName, minValue, maxName, maxValue] of ranges) {
      if (
        minValue !== undefined &&
        maxValue !== undefined &&
        Number(minValue) > Number(maxValue)
      ) {
        return res.status(400).json({
          success: false,
          message: `${minName} cannot be greater than ${maxName}.`,
        });
      }
    }

    // Prevent conflicting exact and range filters
    if (
      bedrooms !== undefined &&
      (minBedrooms !== undefined || maxBedrooms !== undefined)
    ) {
      return res.status(400).json({
        success: false,
        message: "Use bedrooms or bedroom range, not both.",
      });
    }

    if (
      bathrooms !== undefined &&
      (minBathrooms !== undefined || maxBathrooms !== undefined)
    ) {
      return res.status(400).json({
        success: false,
        message: "Use bathrooms or bathroom range, not both.",
      });
    }

    // Validate featured
    if (featured !== undefined && !["true", "false"].includes(featured)) {
      return res.status(400).json({
        success: false,
        message: "featured must be true or false.",
      });
    }

    // ==========================
    // BUILD FILTER
    // ==========================

    const filter = {};

    // ==========================
    // PRICE FILTER
    // ==========================

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // ==========================
    // AREA FILTER
    // ==========================

    if (minArea || maxArea) {
      filter.area = {};

      if (minArea) {
        filter.area.$gte = Number(minArea);
      }

      if (maxArea) {
        filter.area.$lte = Number(maxArea);
      }
    }
    // ==========================
    // BEDROOMS FILTER
    // ==========================

    if (minBedrooms || maxBedrooms) {
      filter.bedrooms = {};

      if (minBedrooms) {
        filter.bedrooms.$gte = Number(minBedrooms);
      }

      if (maxBedrooms) {
        filter.bedrooms.$lte = Number(maxBedrooms);
      }
    }
    // ==========================
    // BATHROOMS FILTER
    // ==========================

    if (minBathrooms || maxBathrooms) {
      filter.bathrooms = {};

      if (minBathrooms) {
        filter.bathrooms.$gte = Number(minBathrooms);
      }

      if (maxBathrooms) {
        filter.bathrooms.$lte = Number(maxBathrooms);
      }
    }
    // ==========================
    // AMENITIES FILTER
    // ==========================

    if (amenities) {
      const amenitiesArray = amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (amenitiesArray.length > 0) {
        filter.amenities = {
          $all: amenitiesArray,
        };
      }
    }
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
      .populate("agent", "firstName lastName email phone profileImage")
      .sort(sortOption)
      .skip(skip)
      .limit(itemsPerPage)
      .lean();

    // ==========================
    // PAGINATION INFO
    // ==========================

    const totalPages = Math.ceil(total / itemsPerPage);

    // res.status(200).json({
    //   success: true,

    //   count: properties.length,

    //   total,

    //   page: currentPage,

    //   limit: itemsPerPage,

    //   pages: totalPages,

    //   hasNextPage: currentPage < totalPages,

    //   hasPrevPage: currentPage > 1,

    //   properties,
    // });
    res.status(200).json({
      success: true,

      data: {
        properties,

        pagination: {
          total,
          count: properties.length,
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

// const createProperty = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       propertyType,
//       purpose,
//       price,
//       currency,
//       bedrooms,
//       bathrooms,
//       area,
//       areaUnit,
//       location,
//       images,
//       amenities,
//       agent,
//       status,
//       featured,
//     } = req.body;

//     if (
//       !title ||
//       !description ||
//       !propertyType ||
//       !purpose ||
//       price === undefined ||
//       area === undefined ||
//       !location?.city ||
//       !location?.area ||
//       !agent
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide all required property fields",
//       });
//     }

//     if (!mongoose.Types.ObjectId.isValid(agent)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid agent ID",
//       });
//     }

//     const property = await Property.create({
//       title,
//       description,
//       propertyType,
//       purpose,
//       price,
//       currency,
//       bedrooms,
//       bathrooms,
//       area,
//       areaUnit,
//       location,
//       images,
//       amenities,
//       agent,
//       status,
//       featured,
//     });

//     const populatedProperty = await property.populate(
//       "agent",
//       "firstName lastName email profileImage"
//     );

//     res.status(201).json({
//       success: true,
//       message: "Property created successfully",
//       property: populatedProperty,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// const createProperty = async (req, res) => {
//   try {
//     console.log("Uploaded files:", req.files);
//     const {
//       title,
//       description,
//       propertyType,
//       purpose,
//       price,
//       currency,
//       bedrooms,
//       bathrooms,
//       area,
//       areaUnit,
//       location,
//       images = [],
//       amenities = [],
//     } = req.body;

//     // Validate required fields
//     if (
//       !title ||
//       !description ||
//       !propertyType ||
//       !purpose ||
//       price === undefined ||
//       area === undefined ||
//       !location?.city ||
//       !location?.area
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide all required property fields",
//       });
//     }

//     // Get agent from authenticated user
//     const agent = req.user._id;

//     // Create property
//     const property = await Property.create({
//       title,
//       description,
//       propertyType,
//       purpose,
//       price,
//       currency,
//       bedrooms,
//       bathrooms,
//       area,
//       areaUnit,
//       location,
//       images,
//       amenities,
//       agent,
//     });

//     // Populate agent information
//     const populatedProperty = await property.populate(
//       "agent",
//       "firstName lastName email profileImage"
//     );

//     return res.status(201).json({
//       success: true,
//       message: "Property created successfully",
//       property: populatedProperty,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

const createProperty = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("UPLOADED FILES:", req.files?.length || 0);

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
      amenities,
    } = req.body;

    // Parse location from JSON string
    let location;

    console.log("RAW LOCATION:", req.body.location);
    console.log("LOCATION TYPE:", typeof req.body.location);
    console.log("========== CREATE PROPERTY ==========");
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    console.log("UPLOADED IMAGES:", req.uploadedImages);

    try {
      location =
        typeof req.body.location === "string"
          ? JSON.parse(req.body.location)
          : req.body.location;
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid location format. Please provide valid JSON.",
      });
    }

    // Validate required fields
    if (
      !title ||
      !description ||
      !propertyType ||
      !purpose ||
      price === undefined ||
      price === "" ||
      area === undefined ||
      area === "" ||
      !location?.city ||
      !location?.area
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required property fields",
      });
    }

    // Get agent from authenticated user
    const agent = req.user._id;

    // Convert numeric fields
    const property = await Property.create({
      title,
      description,
      propertyType,
      purpose,
      price: Number(price),
      currency,
      bedrooms: Number(bedrooms || 0),
      bathrooms: Number(bathrooms || 0),
      area: Number(area),
      areaUnit,
      location,
      // images: [],
      images: req.uploadedImages || [],
      amenities: amenities
        ? Array.isArray(amenities)
          ? amenities
          : [amenities]
        : [],
      agent,
    });

    const populatedProperty = await property.populate(
      "agent",
      "firstName lastName email profileImage"
    );

    return res.status(201).json({
      success: true,
      message: "Property created successfully",
      property: populatedProperty,
    });
  } catch (error) {
    return res.status(500).json({
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
