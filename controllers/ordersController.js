const asyncHandler = require("express-async-handler");
const { User } = require("../models/users");
const {
  UserOrder,
  validateCreateOrder,
  validateUpdateOrder,
} = require("../models/orders");
const { ReturnOrder, validateReturnOrder } = require("../models/returnOrder");
const sendEmail = require("../utils/sendEmail");
const path = require("path");
const fs = require("fs");
const {
  cloudinaryUploadImage,
  cloudinaryReoveImage,
  cloudinaryUploadImages,
  cloudinaryReoveMultipleImage,
} = require("../utils/cloudinary");
const Closing = require("../models/Closing");

module.exports.createNewOrderCtrl = asyncHandler(async (req, res) => {
  // const { error } = validateCreateOrder(req.body);
  // if (error) {
  //   return res.status(400).json({ message: error.details[0].message });
  // }
  const user = await User.find({ _id: req.user.id });
  if (!user) {
    res.status(404).json({ message: "user not found" });
  }
  const order = await UserOrder.create({
    userDetails: req.user.id,
    orderDetails: req.body.newOrder,
    orderStatus: false,
    userInfo: user[0],
    totalPrice: req.body.totalPrice,
    payment: "unpaid",
  });
  res.status(201).json(order);
});

module.exports.getAllOrdersCtrl = asyncHandler(async (req, res) => {
  // const myorders = await UserOrder.find();

  const POST_PER_PAGE = 8;
  const { pageNumber } = req.query;
  let myorders;
  if (pageNumber) {
    myorders = await UserOrder.find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .sort({ createdAt: -1 });
    // .populate("user", ["-password"]);
  } else {
    myorders = await UserOrder.find().sort({ createdAt: -1 });
    // .populate("user", ["-password"]);
  }
  res.status(200).json(myorders);
});

module.exports.getMaxAllOrdersCtrl = asyncHandler(async (req, res) => {
  const myorders = await UserOrder.find().sort({ createdAt: -1 });
  res.status(200).json(myorders);
});

// update the order status

module.exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await UserOrder.findById(req.params.id);

  if (!order) {
    res.status(404).json({ message: "order not found" });
  }

  let updatePost;

  if (req.body.orderStatus == "canceled") {
    updatePost = await UserOrder.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          orderStatus: req.body.orderStatus,
          CancelReason: req.body.CancelReason,
        },
      },
      { new: true }
    );
  }

  updatePost = await UserOrder.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        orderStatus: req.body.orderStatus,
      },
    },
    { new: true }
  );

  // 5- send response to the client
  res.status(200).json(updatePost);
});

module.exports.getOrderCountCtrl = asyncHandler(async (req, res) => {
  const count = await UserOrder.countDocuments();
  res.status(200).json(count);
});

// module.exports.returnOrderCtrl = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.id);
//   if (!user) {
//     res.status(404).json({ message: "user not found" });
//   }

//   const uploadPromises = req.files.map(async (file) => {
//     try {
//       const imagePath = path.join(__dirname, `../images/${file.filename}`);
//       const result = await cloudinaryUploadImage(imagePath);
//       fs.unlink(imagePath, (err) => {
//         if (err) console.error("Error deleting file:", err);
//       });
//       return result;
//     } catch (error) {
//       console.error("Error uploading image:", error);
//       throw new Error("Failed to upload image");
//     }
//   });

//   let uploadResults;
//   try {
//     uploadResults = await Promise.all(uploadPromises);
//   } catch (error) {
//     return res.status(500).json({ message: "Image upload failed" });
//   }

//   // 4- إنشاء المنشور وحفظه في قاعدة البيانات
//   const images = uploadResults.map((result) => ({
//     url: result.secure_url,
//     publicId: result.public_id,
//   }));

//   const returnedOrder = await ReturnOrder.create({
//     user: user,
//     order: req.body.order,
//     reason: req.body.reason,
//     images: images,
//   });
//   res.status(201).json(returnedOrder);
// });

module.exports.returnOrderCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // const { error } = validateReturnOrder(req.body);
  // if (error) {
  //   return res.status(400).json({ message: error.details[0].message });
  // }

  const uploadPromises = (req.files || []).map(async (file) => {
    try {
      const imagePath = path.join(__dirname, `../images/${file.filename}`);

      const result = await cloudinaryUploadImage(imagePath);

      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error("Upload error:", error.message);
      throw error;
    }
  });

  let images = [];
  try {
    images = await Promise.all(uploadPromises);
  } catch (error) {
    return res.status(500).json({ message: "Image upload failed !" });
  }
  const orderData = JSON.parse(req.body.order);
  const returnedOrder = await ReturnOrder.create({
    user: user,
    order: orderData,
    reason: req.body.reason,
    images: images,
    // orderAprovedBy: req.uesr.username,
  });

  res.status(201).json(returnedOrder);
});

module.exports.getAllReturnOrdersCtrl = asyncHandler(async (req, res) => {
  const returnedOrder = await ReturnOrder.find().sort({ createdAt: -1 });
  // .populate("user", ["-password"]);
  res.status(200).json(returnedOrder);
});

module.exports.sendEmailConfirmCtrl = asyncHandler(async (req, res) => {
  const userEmail = await req.body.userEmail;
  const orderName = await req.body.orderName;
  const orderPrice = await req.body.orderPrice;
  const retunReason = await req.body.returnReason;

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const htmlTemplate = `
  <div>
    <p>your order ${orderName} has been improved for return you will receve the money around 3 days total amount is ${orderPrice}dhr </p>
  </div>
  `;
  // sending email to the user
  await sendEmail(userEmail, "Request return order", htmlTemplate);

  const myOrderRecuist = await ReturnOrder.findById(req.body.id);
  const publicIds = myOrderRecuist.images?.map((post) => post.publicId);
  await cloudinaryReoveMultipleImage(publicIds);
  await ReturnOrder.findByIdAndDelete(req.body.id);
  await ReturnOrder.findByIdAndUpdate(
    req.body.id,
    {
      $set: {
        orderAprovedBy: user.username,
        rejectReason: retunReason,
        returnStatus: "aproved",
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json({ message: "the information has been send to the user successfuly" });

  res
    .status(200)
    .json({ message: "the information has been send to the user successfuly" });
});

module.exports.sendEmailDiclineCtrl = asyncHandler(async (req, res) => {
  const userEmail = await req.body.userEmail;
  const orderName = await req.body.orderName;
  const retunReason = await req.body.returnReason;
  // const orderAbrovededBy = await req.user.username;

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const htmlTemplate = `
  <div>
    <p>your order ${orderName} has been rejected because ${retunReason}</p>
  </div>
  `;
  // sending email to the user
  await sendEmail(userEmail, "Request return order", htmlTemplate);

  const myOrderRecuist = await ReturnOrder.findById(req.body.id);
  const publicIds = myOrderRecuist.images?.map((post) => post.publicId);
  await cloudinaryReoveMultipleImage(publicIds);
  await ReturnOrder.findByIdAndDelete(req.body.id);

  await ReturnOrder.findByIdAndUpdate(
    req.body.id,
    {
      $set: {
        orderAprovedBy: user.username,
        rejectReason: retunReason,
        returnStatus: "rejected",
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json({ message: "the information has been send to the user successfuly" });
});

// module.exports.paymentOrderCtrl = asyncHandler(async (req, res) => {
//   // 1- validation
//   // const { error } = validateUpdateOrder(req.body);
//   // if (error) {
//   //   return res.status(400).json({ message: error.details[0].message });
//   // }

//   const order = await UserOrder.findById(req.params.id);

//   if (!order) {
//     res.status(404).json({ message: "order not found" });
//   }

//   const updatePost = await UserOrder.findByIdAndUpdate(
//     req.params.id,
//     {
//       $set: {
//         payment: req.body.payment,
//       },
//     },
//     { new: true }
//   );

//   // 5- send response to the client
//   res.status(200).json(updatePost);
// });

// module.exports.paymentOrderCtrl = asyncHandler(async (req, res) => {
//   const { error } = validateUpdateOrder(req.body);
//   if (error) {
//     return res.status(400).json({ message: error.details[0].message });
//   }

//   const { id } = req.params;
//   const { payment } = req.body;

//   // تحقق من وجود الطلب
//   const order = await UserOrder.findById(id);
//   if (!order) {
//     return res.status(404).json({ message: "Order not found" });
//   }

//   // تحديث الدفع
//   order.payment = payment;
//   await order.save();

//   res.status(200).json({ message: "Payment status updated", order });
// });

module.exports.paymentOrderCtrl = asyncHandler(async (req, res) => {
  const { error } = validateUpdateOrder(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { orderId } = req.params;
  const { payment } = req.body;

  if (!payment) {
    return res.status(400).json({ message: "Payment value is required" });
  }
  const user = await User.findById(req.user.id);
  const order = await UserOrder.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.payment = payment;
  order.closeBy = user.username;
  order.closeTime = Date.now();
  await order.save();

  res.status(200).json({ message: "Payment updated successfully", order });
});

module.exports.closingOrdersCtrl = asyncHandler(async (req, res) => {
  try {
    const { products } = req.body;

    // const totalCash = products
    //   .filter((p) => p.payment === "cash")
    //   .reduce((sum, p) => sum + p.totalPrice, 0);

    // const totalVisa = products
    //   .filter((p) => p.payment === "visa")
    //   .reduce((sum, p) => sum + p.totalPrice, 0);

    // const totalCredit = products
    //   .filter((p) => p.payment === "credit")
    //   .reduce((sum, p) => sum + p.totalPrice, 0);

    const totalCash = products
      .filter((p) => p.payment === "cash")
      .reduce(
        (sum, p) =>
          sum + parseFloat(String(p.totalPrice).replace(/[^\d.]/g, "")),
        0
      );

    const totalVisa = products
      .filter((p) => p.payment === "visa")
      .reduce(
        (sum, p) =>
          sum + parseFloat(String(p.totalPrice).replace(/[^\d.]/g, "")),
        0
      );

    const totalCredit = products
      .filter((p) => p.payment === "credit")
      .reduce(
        (sum, p) =>
          sum + parseFloat(String(p.totalPrice).replace(/[^\d.]/g, "")),
        0
      );

    const closing = await Closing.create({
      products,
      totalCash,
      totalVisa,
      totalCredit,
    });
    await UserOrder.deleteMany({});
    res.status(201).json(closing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports.getClosingOrdersCtrl = asyncHandler(async (req, res) => {
  try {
    const closings = await Closing.find().sort({ date: -1 });
    res.json(closings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// module.exports.updateOrderStatus = asyncHandler(async (req, res) => {
//   const order = await UserOrder.findById(req.params.id);

//   if (!order) {
//     res.status(404).json({ message: "order not found" });
//   }

//   const updatePost = await UserOrder.findByIdAndUpdate(
//     req.params.id,
//     {
//       $set: {
//         orderStatus: req.body.orderStatus,
//       },
//     },
//     { new: true }
//   );

//   // 5- send response to the client
//   res.status(200).json(updatePost);
// });
