import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

import authRoutes from "@routes/auth.route";
import userRoutes from "@routes/user.route";
import postRoutes from "@routes/post.route";
import tagRoutes from "@routes/tag.route";
import connectDB from "@config/connectDB";

import { notFound, errorHandler } from "@middlewares/error.middleware";
import passport from "@middlewares/passport.middleware";
import sessionMiddleware from "@middlewares/session.middleware";

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();

app.use(morgan("dev"));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
// app.use("/api/tags", tagRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
