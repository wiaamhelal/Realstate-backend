const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// Upload one image to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "real-estate/properties",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Upload all property images
const cloudinaryUploadMiddleware = async (req, res, next) => {
  console.log("CLOUDINARY MIDDLEWARE REACHED");
  console.log("FILES RECEIVED:", req.files?.length || 0);
  const uploadedImages = [];

  try {
    if (!req.files || req.files.length === 0) {
      req.uploadedImages = [];
      console.log("CLOUDINARY UPLOADED:", req.uploadedImages);
      return next();
    }

    for (const file of req.files) {
      const image = await uploadToCloudinary(file.buffer);
      uploadedImages.push(image);
    }

    req.uploadedImages = uploadedImages;

    next();
  } catch (error) {
    // Delete images already uploaded if a later upload fails
    await Promise.allSettled(
      uploadedImages.map((image) => cloudinary.uploader.destroy(image.publicId))
    );

    next(error);
  }
};

module.exports = { cloudinaryUploadMiddleware };
