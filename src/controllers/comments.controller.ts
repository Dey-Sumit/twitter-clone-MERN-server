import { ExtendedRequest } from "@libs/types";
import { Response, Request } from "express";
import expressAsyncHandler from "express-async-handler";

import Post from "@models/Post";
import { Types } from "mongoose";

// @ route POST /api/posts/:id/comments/
// @ desc create comment by postId
// @ access private

export const createComment = expressAsyncHandler(async (req: ExtendedRequest, res) => {
  const authUserId = req.user!._id;
  // TODO remove Types.ObjectId
  const content = req.body.content;
  //TODO change all msg to message
  const post = await Post.findById(req.query.id);
  if (!post) {
    return res.status(404).json({ msg: "Post not found" });
  }
  if (!content) return res.status(401).json({ msg: "Content is required" });

  const newComment = {
    content: req.body.content,
    user: authUserId,
  };

  // post.comments.unshift(newComment);
  await post.save();
  const comments = post.populate("comments.user", "username");
  return res.status(200).json(comments);
});

// @ route GET /api/posts/:id/comments/
// @ desc get comments by postId
// @ access public

export const getCommentsByPostId = expressAsyncHandler(async (req, res) => {
  // TODO FIX THIS , length of undefined in populating fields ; working fine for the post request

  const post = await Post.findById(req.query.id).populate("comments.user", "name");

  res.status(200).json(post.comments);
});
