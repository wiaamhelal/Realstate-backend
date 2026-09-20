const path = require("path");
const multer = require("multer");

// إعداد التخزين
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../images"));
  },
  filename: function (req, file, cb) {
    if (file) {
      cb(null, Date.now() + "-" + file.originalname);
    } else {
      cb(new Error("File not provided"), false);
    }
  },
});

// إعداد `multer` لقبول الصور فقط
const photoUpload = multer({
  storage: photoStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file format. Please upload an image."), false);
    }
  },
  limits: { fileSize: 1024 * 1024 * 10 }, // 5MB كحد أقصى
});

module.exports = photoUpload;
