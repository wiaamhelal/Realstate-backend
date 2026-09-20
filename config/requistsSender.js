// const https = require("https");

// setInterval(() => {
//   https
//     .get("https://back-end-mern-9wjc.onrender.com", (res) => {
//       console.log(`Status Code: ${res.statusCode}`);
//     })
//     .on("error", (err) => {
//       console.error(`Error: ${err.message}`);
//     });
// }, 300000); // Ping every 5 minutes

// const axios = require("axios");

// const url = "https://back-end-mern-1-c5va.onrender.com"; // رابط موقعك

// setInterval(async () => {
//   try {
//     const response = await axios.get(url);
//     console.log(`Pinged ${url}, Status Code: ${response.status}`);
//   } catch (error) {
//     console.error(`Error pinging ${url}:`, error.message);
//   }
// }, 300000); // 300000 ميلي ثانية (5 دقائق)
