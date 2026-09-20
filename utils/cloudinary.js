const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//cloudinary upload image
const cloudinaryUploadImage = async (myImage) => {
  try {
    const data = await cloudinary.uploader.upload(myImage, {
      resource_type: "auto",
      overwrite: false,
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("internal server error (coudinary)");
  }
};

const cloudinaryUploadImages = async (images) => {
  try {
    // التأكد من أن المدخل هو مصفوفة
    if (!Array.isArray(images)) {
      throw new Error("Input must be an array of image paths/URLs.");
    }

    // رفع كل الصور باستخدام Promise.all
    const uploadPromises = images.map((image) =>
      cloudinary.uploader.upload(image, {
        resource_type: "auto", // يحدد نوع الملف تلقائيًا
      })
    );

    // انتظار كل العمليات والحصول على النتائج
    const uploadResults = await Promise.all(uploadPromises);

    return uploadResults; // مصفوفة تحتوي على بيانات كل صورة مرفوعة
  } catch (error) {
    console.error("Error uploading images:", error);
    throw new Error("Internal server error (cloudinary)");
  }
};

//cloudinary remove image
const cloudinaryReoveImage = async (imagePublicId) => {
  try {
    const result = await cloudinary.uploader.destroy(imagePublicId);
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("internal server error (coudinary)");
  }
};

//cloudinary remove multiple image
const cloudinaryReoveMultipleImage = async (publicIds) => {
  try {
    const result = await cloudinary.v2.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("internal server error (coudinary)");
  }
};

module.exports = {
  cloudinaryUploadImage,
  cloudinaryReoveImage,
  cloudinaryReoveMultipleImage,
  cloudinaryUploadImages,
};
