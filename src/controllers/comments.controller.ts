import { ExtendedRequest } from "@libs/types";
import expressAsyncHandler from "express-async-handler";

import Post from "@models/Post";
import { BadRequest, NotFound } from "http-errors";
import Notification from "@models/Notification";
import User from "@models/User";

/**
 * @method POST
 * @access Private
 * @endpoint /api/posts/:id/comments/
 */

export const createComment = expressAsyncHandler(async (req: ExtendedRequest, res) => {
  const authUserId = req.user._id;

  const content = req.body.content;
  const post = await Post.findById(req.params.id).populate("user", "_id");

  if (!post) throw new NotFound("Post Not Found");
  if (!content) throw new BadRequest("Content is required");

  const newComment = {
    content: req.body.content,
    user: authUserId,
  };

  post.comments.unshift(newComment);
  await post.save();

  const data = {
    userFrom: req.user._id,
    notificationType: "comment",
    entityId: post._id,
  };

  const notification = await Notification.create(data);
  // console.log({ notification });

  // await might not be needed here
  await User.findByIdAndUpdate(
    //@ts-ignore
    post.user._id,
    {
      $push: {
        notifications: notification._id,
      },
    },
    { new: true }
  );

  const comments = post.populate("comments.user", "username");
  res.status(200).json(comments);
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
