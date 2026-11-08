import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectToDb from "./config/connectToDb.js";
import { notFound, errorHandler } from "./models/error.js";
import authRoutes from "./routes/authRoutes.js";
import propertyRoutes from "./routes/propertyRoute.js";
import favoriteRoutes from "./routes/favoriteRoute.js";

const app = express();

// Connect to MongoDB
connectToDb();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/favorites", favoriteRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Real Estate API is running on port ${PORT}`);
});
