import {
  createComment,
  getCommentsByPostId,
} from "@controllers/comments.controller";
import authMiddleware from "@middlewares/auth.middleware";
import {
  createPost,
  deletePostById,
  getFeedByUserId,
  getPostById,
  ratePostById,
} from "controllers/posts.controller";
import express from "express";

const router = express.Router();

router.post("/", authMiddleware, createPost);
router.get("/:id", getPostById);
router.delete("/:id", authMiddleware, deletePostById);
router.get("/:id/comments", getCommentsByPostId);
router.post("/:id/comments", authMiddleware, createComment);
router.put("/:id/rate", authMiddleware, ratePostById);
router.post("/feed/:userId", getFeedByUserId); // TODO might be a better fit for user route

export default router;
