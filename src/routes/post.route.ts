import { createComment, getCommentsByPostId } from "@controllers/comments.controller";
import authMiddleware from "@middlewares/auth.middleware";
import uploadFile from "@middlewares/uploadFile.middleware";
import {
  createPost,
  deletePostById,
  getFeed,
  getPostById,
  ratePostById,
} from "@controllers/posts.controller";

import express from "express";

const router = express.Router();

router.post("/", authMiddleware, uploadFile().single("attachment"), createPost);
router.get("/feed", getFeed);

router.route("/:id").get(getPostById).delete(authMiddleware, deletePostById);

router.route("/:id/comments").get(getCommentsByPostId).post(authMiddleware, createComment);
router.put("/:id/rate", authMiddleware, ratePostById);

export default router;
