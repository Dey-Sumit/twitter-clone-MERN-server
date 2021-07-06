import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { v2 as cloudinary } from "cloudinary";
import chalk from "chalk";
import { createServer } from "http";
const { instrument } = require("@socket.io/admin-ui");

import authRoutes from "@routes/auth.route";
import userRoutes from "@routes/user.route";
import postRoutes from "@routes/post.route";
import tagRoutes from "@routes/tag.route";
import notificationRoutes from "@routes/notification.route";

import connectDB from "@config/connectDB";

import { notFound, errorHandler } from "@middlewares/error.middleware";
import passport from "@middlewares/passport.middleware";
import sessionMiddleware from "@middlewares/session.middleware";
import { Server, Socket } from "socket.io";
import socket from "socket";

const morganChalk = morgan(function (tokens, req, res) {
  return [
    chalk.green.bold(tokens.method(req, res)),
    chalk.blue.bold(tokens.status(req, res)),
    chalk.white(tokens.url(req, res)),
    // chalk.yellow(tokens["response-time"](req, res) + " ms"),
  ].join(" ");
});

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  //TODO I might not need these config ,
  cors: {
    origin: [process.env.CLIENT_URL, "https://admin.socket.io"],
    credentials: true,
  },
});

instrument(io, {
  auth: false,
});

app.use(morganChalk);
console.log(process.env.CLIENT_URL);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
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
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/notifications", notificationRoutes);

// error handlers
app.use(notFound);
app.use(errorHandler);

httpServer.listen(PORT, () => {
  connectDB(); // asyncly connected to db
  console.log(chalk.green(`-> Server is Running on ${PORT}`));
  socket({ io });
});
