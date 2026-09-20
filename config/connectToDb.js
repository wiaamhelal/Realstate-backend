// const mongoose = require("mongoose");

// const url =
//   "mongodb+srv://wiaambusiness28:FK25ie.pjX4Mxw@cluster0.zqolu1d.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0";
// module.exports = async () => {
//   try {
//     await mongoose.connect(url, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 30000, // زيادة المهلة لتفادي timeout
//     });
//     console.log("✅ Connected to MongoDB");
//   } catch (error) {
//     console.error("❌ Connection to MongoDB failed:", error.message);
//   }
// };

const mongoose = require("mongoose");

// const url =
//   "mongodb+srv://wiaambusiness28:FK25ie.pjX4Mxw@cluster0.zqolu1d.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0/";

const url =
  "mongodb+srv://wiaambusiness28_db_user:ngMxP7lzw50ealU8@cluster0.vzzglz4.mongodb.net/";

module.exports = async () => {
  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Connection to MongoDB failed:", error.message);
  }
};

//wiaambusiness28_db_user
//ngMxP7lzw50ealU8
