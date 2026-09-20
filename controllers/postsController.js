const fs = require("fs");
const path = require("path");
const asyncHander = require("express-async-handler");
const {
  validateCreatePost,
  Post,
  validateUpdatePost,
} = require("../models/posts");
const {
  cloudinaryUploadImage,
  cloudinaryReoveImage,
  cloudinaryUploadImages,
  cloudinaryReoveMultipleImage,
} = require("../utils/cloudinary");
const { Comment } = require("../models/comments");
const {
  validateCreateClientComment,
  UserComment,
} = require("../models/userComent");
const { User } = require("../models/users");
const {
  ProductAd,
  validateCreateProductAd,
} = require("../models/CreateProuctAd");
const { AdFor24Hours } = require("../models/AdFor24Hours");

//-----------------------------
// desc greate a new post
// route /api/posts
// method POST
// access only logged user
//-----------------------------

// module.exports.createPostCtrl = asyncHander(async (req, res) => {
//   // 1-validate image
//   if (!req.file) {
//     return res.status(400).json({ message: "no image provided" });
//   }

//   // 2-validate the data
//   const { error } = validateCreatePost(req.body);
//   if (error) res.status(400).json({ message: error.details[0].message });

//   // 3- upload photo
//   const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

//   const result = await cloudinaryUploadImage(imagePath);

//   // 4-create a new post and save it in DB
//   let post = await Post.create({
//     title: req.body.title,
//     price: req.body.price,
//     description: req.body.description,
//     productDetails: req.body.productDetails,
//     category: req.body.category,
//     user: req.user.id,
//     image: {
//       url: result.secure_url,
//       publicId: result.public_id,
//     },
//   });

//   // 5- send response to the client
//   res.status(201).json(post);

//   // 6- rmeove the image from the server
//   fs.unlinkSync(imagePath);
// });

module.exports.createPostCtrl = asyncHander(async (req, res) => {
  // // 1- التحقق من وجود الصور
  // if (!req.files || req.files.length === 0) {
  //   return res.status(400).json({ message: "No images provided" });
  // }

  // // 2- التحقق من صحة البيانات
  // const { error } = validateCreatePost(req.body);
  // if (error) {
  //   return res.status(400).json({ message: error.details[0].message });
  // }

  // // 3- رفع الصور إلى Cloudinary
  // const uploadPromises = req.files.map(async (file) => {
  //   try {
  //     const imagePath = path.join(__dirname, `../images/${file.filename}`);
  //     const result = await cloudinaryUploadImage(imagePath);
  //     fs.unlink(imagePath, (err) => {
  //       if (err) console.error("Error deleting file:", err);
  //     });
  //     return result;
  //   } catch (error) {
  //     console.error("Error uploading image:", error);
  //     throw new Error("Failed to upload image");
  //   }
  // });

  // let uploadResults;
  // try {
  //   uploadResults = await Promise.all(uploadPromises);
  // } catch (error) {
  //   return res.status(500).json({ message: "Image upload failed" });
  // }

  // // 4- إنشاء المنشور وحفظه في قاعدة البيانات
  // const images = uploadResults.map((result) => ({
  //   url: result.secure_url,
  //   publicId: result.public_id,
  // }));

  console.log("FILES >>> ", req.files);
  console.log("BODY >>> ", req.body);
  // 1- التحقق من وجود الصور
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No images provided" });
  }

  // 2- التحقق من صحة البيانات
  // const { error } = validateCreatePost(req.body);
  // if (error) {
  //   return res.status(400).json({ message: error.details[0].message });
  // }

  // 3- رفع الصور إلى Cloudinary
  const uploadPromises = req.files.map(async (file) => {
    try {
      const imagePath = path.join(__dirname, `../images/${file.filename}`);
      const result = await cloudinaryUploadImage(imagePath);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
      return result;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  });

  let uploadResults;
  try {
    uploadResults = await Promise.all(uploadPromises);
  } catch (error) {
    return res.status(500).json({ message: "Image upload failed" });
  }

  // 4- إنشاء المنشور وحفظه في قاعدة البيانات
  const images = uploadResults.map((result) => ({
    url: result.secure_url,
    publicId: result.public_id,
  }));

  let post;
  try {
    post = await Post.create({
      title: req.body.title,
      price: req.body.price,
      oldPrice: null,
      description: req.body.description,
      productDetails: req.body.productDetails,
      category: req.body.category,
      mainCategory: req.body.mainCategory,
      user: req.user.id,
      images,
      colors: req.body.colors,
      sales: 0,
      premium: req.body.premium,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Failed to create post" });
  }

  // 5- الرد النهائي
  res.status(201).json({
    message: "Post created successfully",
    post,
  });
});

//-----------------------------
// desc get all posts
// route /api/posts
// method GET
// access public
//-----------------------------
module.exports.getAllPostsCtrl = asyncHander(async (req, res) => {
  let POST_PER_PAGE = 8;

  const { pageNumber, category } = req.query;

  let posts;
  if (pageNumber) {
    posts = await Post.find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else if (category) {
    posts = await Post.find({ category })
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else {
    posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  }
  res.status(200).json(posts);
});

module.exports.getAllMaxPostsCtrl = asyncHander(async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("user", ["-password"]);

  res.status(200).json(posts);
});

//-----------------------------
// desc get single post
// route /api/posts/:id
// method GET
// access public
//-----------------------------
module.exports.getSinglePostCtrl = asyncHander(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("comments");
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  res.status(200).json(post);
});

//-----------------------------
// desc get posts count
// route /api/posts/count
// method GET
// access public
//-----------------------------
module.exports.getPostCountCtrl = asyncHander(async (req, res) => {
  const count = await Post.countDocuments();
  res.status(200).json(count);
});

//-----------------------------
// desc delete post
// route /api/posts/:id
// method DEDETE
// access the admin or the post owner
//-----------------------------
module.exports.deletePostCtrl = asyncHander(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  if (req.user.isAdmin || req.user.id === post.user.toString()) {
    const publicIds = post.images?.map((post) => post.publicId);

    await Post.findByIdAndDelete(req.params.id);
    await cloudinaryReoveMultipleImage(publicIds);

    // TODO - delete all comments that belong to the post
    await Comment.deleteMany({ postId: post._id });

    res.status(200).json({
      message: "the post has been deleted",
      postId: post._id,
    });
  } else {
    res.status(403).json({ message: "unauthoraized , access denied" });
  }
});

//-----------------------------
// desc update post
// route /api/posts/:id
// method put
// access the owner only
//-----------------------------
module.exports.updatePostCtrl = asyncHander(async (req, res) => {
  // 1-validation
  const { error } = validateUpdatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // 2-get the post from DB and check of the post is exist
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404).json({ message: "post not found" });
  }

  // 3-check if the post belong to this user
  if (req.user.id !== post.user.toString()) {
    return res
      .status(403)
      .json({ message: "unauthoraized , you cant update the user" });
  }

  // 4- update the post
  const updatePost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        oldPrice: req.body.oldPrice,
        sales: req.body.sales,
      },
    },
    { new: true }
  )
    .populate("user", ["-password"])
    .populate("comments");

  // 5- send response to the client
  res.status(200).json(updatePost);
});

//-----------------------------
// desc update post image
// route /api/posts/upload-image/:id
// method put
// access the owner only
//-----------------------------
module.exports.updatePostImageCtrl = asyncHander(async (req, res) => {
  // 1-validation
  if (!req.file) {
    return res.status(400).json({ message: "its not an image" });
  }

  // 2-get the post from DB and check of the post is exist
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404).json({ message: "post not found" });
  }

  // 3-check if the post belong to this user
  if (req.user.id !== post.user.toString()) {
    return res
      .status(403)
      .json({ message: "unauthoraized , you cant update the user" });
  }

  // 4- delete the old image
  await cloudinaryReoveImage(post.image.publicId);

  // 5- upload a new image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  // 6- update the image field in the DB
  const updatePost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  );

  // 7- send response to the client
  res.status(200).json(updatePost);

  // 8- delete the image from the server
  fs.unlinkSync(imagePath);
});

module.exports.updatePostImage2Ctrl = asyncHander(async (req, res) => {
  // 1-validation
  if (!req.file) {
    return res.status(400).json({ message: "its not an image" });
  }

  // 2-get the post from DB and check of the post is exist
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404).json({ message: "post not found" });
  }

  // 3-check if the post belong to this user
  if (req.user.id !== post.user.toString()) {
    return res
      .status(403)
      .json({ message: "unauthoraized , you cant update the user" });
  }

  // 4- delete the old image
  if (post.image.publicId) {
    await cloudinaryReoveImage(post.image2.publicId);
  }

  // 5- upload a new image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  // 6- update the image field in the DB
  const updatePost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image2: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  );

  // 7- send response to the client
  res.status(200).json(updatePost);

  // 8- delete the image from the server
  fs.unlinkSync(imagePath);
});

//-----------------------------
// desc toggle like
// route /api/posts/:id
// method put
// access only the logged in user
//-----------------------------
module.exports.toggleLikeCtrl = asyncHander(async (req, res) => {
  let post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  const isPostAlreadyLiked = post.likes.find(
    (userId) => userId.toString() === req.user.id
  );
  if (isPostAlreadyLiked) {
    post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          likes: req.user.id,
        },
      },
      { new: true }
    );
  } else {
    post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          likes: req.user.id,
        },
      },
      { new: true }
    );
  }

  res.status(200).json(post);
});

//-----------------------------
// desc toggle dislike
// route /api/posts/:id
// method put
// access only the logged in user
//-----------------------------
module.exports.toggleDislikeCtrl = asyncHander(async (req, res) => {
  let post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  const isPostAlreadyLiked = post.dislikes.find(
    (userId) => userId.toString() === req.user.id
  );
  if (isPostAlreadyLiked) {
    post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          dislikes: req.user.id,
        },
      },
      { new: true }
    );
  } else {
    post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          dislikes: req.user.id,
        },
      },
      { new: true }
    );
  }

  res.status(200).json(post);
});

module.exports.createAdPostCtrl = asyncHander(async (req, res) => {
  // const { error } = validateCreateProductAd(req.body);
  // if (error) res.status(400).json({ message: error.details[0].message });

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  const order = await Post.findById(req.body.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  const createad = await ProductAd.create({
    order: order,
    user: user,
  });

  // 5- send response to the client
  res.status(201).json(createad);
});

// create ad
module.exports.getAllProductsAdsCtrl = asyncHander(async (req, res) => {
  const allAds = await ProductAd.find();
  res.status(200).json(allAds);
});

module.exports.deleteProductAdCtrl = asyncHander(async (req, res) => {
  const ads = await ProductAd.findById(req.params.id);
  if (!ads) {
    return res.status(404).json({ message: "ad not found" });
  }
  await ProductAd.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "ad has been deleted", adId: ads._id });
});

module.exports.createAdFor24HoursCtrl = asyncHander(async (req, res) => {
  // const { error } = validateCreateProductAd(req.body);
  // if (error) res.status(400).json({ message: error.details[0].message });

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  const order = await Post.findById(req.body.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  const createad = await AdFor24Hours.create({
    order: order,
    user: user,
  });

  // 5- send response to the client
  res.status(201).json(createad);
});
module.exports.clearDiscoutCtrl = asyncHander(async (req, res) => {
  // 1-validation
  const { error } = validateUpdatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // 2-get the post from DB and check of the post is exist
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404).json({ message: "post not found" });
  }

  // 3-check if the post belong to this user
  if (req.user.id !== post.user.toString()) {
    return res
      .status(403)
      .json({ message: "unauthoraized , you cant update the user" });
  }

  // 4- update the post
  const updatePost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        price: req.body.price,
        oldPrice: req.body.oldPrice,
      },
    },
    { new: true }
  )
    .populate("user", ["-password"])
    .populate("comments");

  // 5- send response to the client
  res.status(200).json(updatePost);
});

// create ad
module.exports.get24ProductsAdsCtrl = asyncHander(async (req, res) => {
  const allAds = await AdFor24Hours.find();
  res.status(200).json(allAds);
});

module.exports.deleteProductAd24Ctrl = asyncHander(async (req, res) => {
  const ads = await AdFor24Hours.findById(req.params.id);
  if (!ads) {
    return res.status(404).json({ message: "ad not found" });
  }
  await AdFor24Hours.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "ad has been deleted", adId: ads._id });
});

// module.exports.deleteProductAdCtrl = asyncHander(async (req, res) => {
//   const ads = await ProductAd.findById(req.params.id);
//   if (!ads) {
//     return res.status(404).json({ message: "ad not found" });
//   }
//   await ProductAd.findByIdAndDelete(req.params.id);
//   res.status(200).json({ message: "ad has been deleted", adId: ads._id });
// });
