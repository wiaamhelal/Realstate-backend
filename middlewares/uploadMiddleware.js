const multer = require("multer");

// Store uploaded files in memory
const storage = multer.memoryStorage();

// Allow only supported image formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(
    new Error("Invalid image format. Only JPEG, PNG, and WebP are allowed."),
    false
  );
};

// Configure Multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per image
    files: 10, // Maximum 10 images
  },
});

// Export property image uploader
const uploadPropertyImages = upload.array("images", 10);

const debugUpload = (req, res, next) => {
  console.log("MULTER FILES:", req.files);
  next();
};

module.exports = {
  uploadPropertyImages,
};
