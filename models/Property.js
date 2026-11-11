const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    propertyType: {
      type: String,
      required: true,
      enum: [
        "apartment",
        "villa",
        "townhouse",
        "penthouse",
        "office",
        "shop",
        "warehouse",
        "land",
      ],
    },

    purpose: {
      type: String,
      required: true,
      enum: ["sale", "rent"],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "AED",
    },

    bedrooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    bathrooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    area: {
      type: Number,
      required: true,
      min: 0,
    },

    areaUnit: {
      type: String,
      enum: ["sqft", "sqm"],
      default: "sqft",
    },

    location: {
      city: {
        type: String,
        required: true,
        trim: true,
      },

      area: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        trim: true,
      },

      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },

        publicId: {
          type: String,
        },
      },
    ],

    amenities: [
      {
        type: String,
        trim: true,
      },
    ],

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["available", "sold", "rented", "pending"],
      default: "available",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    approved: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Common listing queries
propertySchema.index({
  status: 1,
  approved: 1,
  createdAt: -1,
});

// Sale / rent listings
propertySchema.index({
  purpose: 1,
  status: 1,
  approved: 1,
  createdAt: -1,
});

// Location-based search
propertySchema.index({
  "location.city": 1,
  "location.area": 1,
  status: 1,
  approved: 1,
});

// Property type filtering
propertySchema.index({
  propertyType: 1,
  purpose: 1,
  status: 1,
  approved: 1,
});

// Price sorting and filtering
propertySchema.index({
  purpose: 1,
  status: 1,
  price: 1,
});

// Featured listings
propertySchema.index({
  featured: -1,
  createdAt: -1,
});
const Property = mongoose.model("Property", propertySchema);
module.exports = Property;
