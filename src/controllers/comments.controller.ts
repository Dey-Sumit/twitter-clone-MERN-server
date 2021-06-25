import { ExtendedRequest } from "@libs/types";
import expressAsyncHandler from "express-async-handler";

import Post from "@models/Post";
import { BadRequest, NotFound } from "http-errors";

/**
 * @method POST
 * @access Private
 * @endpoint /api/posts/:id/comments/
 */

export const createComment = expressAsyncHandler(async (req: ExtendedRequest, res) => {
  const authUserId = req.user._id;

  const content = req.body.content;
  const post = await Post.findById(req.params.id);

  if (!post) throw new NotFound("Post Not Found");
  if (!content) throw new BadRequest("Content is required");

  const newComment = {
    content: req.body.content,
    user: authUserId,
  };

  post.comments.unshift(newComment);
  await post.save();

  const comments = post.populate("comments.user", "username");
  return res.status(200).json(comments);
});

/**
 * @method GET
 * @access Public
 * @endpoint /api/posts/:id/comments"
 */

export const getCommentsByPostId = expressAsyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("comments.user", "name username");

  res.status(200).json(post.comments);
});
