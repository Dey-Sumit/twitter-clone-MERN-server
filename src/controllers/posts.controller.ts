import { ExtendedRequest, IPost, IUser } from "@libs/types";
import { NextFunction, Response } from "express";

import { v2 as cloudinary } from "cloudinary";
import expressAsyncHandler from "express-async-handler";
import { addPostToTag, addTagToPost } from "@services/post.service";
import createError from "http-errors";
import Post from "@models/Post";
import User from "@models/User";
import Tag from "@models/Tag";
import Notification from "@models/Notification";

/**
 * @desc get user feed posts
   @route GET /api/posts/feed
   @access private | public
 */

export const getFeed = expressAsyncHandler(async (req: ExtendedRequest, res) => {
  let user: IUser = req.user;

  const { page } = req.query;
  const pageSize = 6;
  const pageNumber = Number(page) || 0;

  let posts: IPost[];

  // if no user is logged in or if the user is logged in but not following anyone, return a generic feed
  if (!user || user?.following.length === 0) {
    posts = await Post.aggregate([{ $sample: { size: pageSize } }]);

    posts = await Post.populate(posts, { path: "user tags" });

    res.json({
      posts,
    });
    return;
  }

  const option = req.user
    ? {
        $or: [{ user: { $in: user.following } }, { user: user._id }],
      }
    : {};

  posts = await Post.find(option);

  const count = posts.length;

  posts = await Post.find(option)
    .limit(pageSize)
    .skip(pageSize * pageNumber)
    .populate("user", "username name profilePicture")
    .populate("tags", "name")
    .sort("-createdAt");

  res.json({
    posts: posts,
    page: pageNumber,
    pages: Math.ceil(count / pageSize) - 1,
  });
});

export const getPostsByUserId = expressAsyncHandler(async (req: ExtendedRequest, res) => {
  const { page, uid } = req.query;
  const pageSize = 10;
  const pageNumber = Number(page) || 0;

  let posts: IPost[];

  const option = { user: uid as string };

  posts = await Post.find(option);

  const count = posts.length;

  posts = await Post.find(option)
    .limit(pageSize)
    .skip(pageSize * pageNumber)
    .populate("user", "username name profilePicture")
    .populate("tags", "name")
    .sort("-createdAt");

  res.json({
    posts: posts,
    page: pageNumber,
    pages: Math.ceil(count / pageSize) - 1,
  });
});
export const getRandom = expressAsyncHandler(async (req: ExtendedRequest, res) => {
  const posts = await Post.aggregate([{ $sample: { size: 5 } }]);
  res.json({
    posts,
  });
});

/**
 * @desc create post
 @route POST /api/posts
 @access private
 */

export const createPost = expressAsyncHandler(async (req: ExtendedRequest, res, next: NextFunction) => {
  const { content, tags }: { content: string; tags?: string } = req.body;

  const tagsArray = tags && [...new Set(tags.split(","))]; // convert to an array and remove duplicates if the tags are present

  if (!content) throw new createError.BadRequest("Content is Required");

  // insert post
  let attachmentURL: string, cloudinaryImageId: string;

  if (req.file) {
    const image = await cloudinary.uploader.upload(req.file.path);
    attachmentURL = image.secure_url;
    cloudinaryImageId = image.public_id;
  }

  const postDoc: IPost = {
    user: req.user._id,
    content: req.body.content,
    attachmentURL,
    cloudinaryImageId,
  };

  let post = await Post.create(postDoc);

  // 1 . add the post inside user doc
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: {
        posts: post._id,
      },
    },
    {
      new: true,
    }
  );
  //2. add tag to post
  //Promise.all = stackoverflow.com/questions/40140149/use-async-await-with-array-map

  if (tags) {
    await Promise.all(
      tagsArray.map(async (tagName) => {
        // check if the tag is already created
        const tag = await Tag.findOne({
          name: tagName,
        });

        //stackoverflow.com/questions/11963684/how-to-push-an-array-of-objects-into-an-array-in-mongoose-with-one-call
        // if created ->find the post and add the tag
        if (tag) {
          post = await addTagToPost(post, tag);

          // add the post under the tag
          await addPostToTag(tag, post);
        } else {
          //  if the tag is new then create a new tag
          const newTag = await Tag.create({ name: tagName });

          // add the tag to the post
          post = await addTagToPost(post, newTag);

          // add the post under the tag
          await addPostToTag(newTag, post);
        }
      })
    );
  }
  res.status(200).json(post);
});

/**
 * @method GET
 * @access Public
 * @endpoint /api/posts/:id/comments/
 */

export const getPostById = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  // try {
  const post = await Post.findById(id)
    .populate("user")
    // .populate("likes.user") // if you want to show the users who liked the post
    .populate("comments.user")
    .populate("tags", "name");

  if (!post) throw new createError.NotFound();
  res.status(200).json(post);
});

/**
 * @method DELETE
 * @access Private
 * @endpoint api/posts/:id
 */

export const deletePostById = expressAsyncHandler(async (req: ExtendedRequest, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) throw new createError.NotFound();

  if (post.user.toString() !== req.user._id.toString()) throw new createError.Unauthorized();

  const cloudinaryImageId = post.cloudinaryImageId;

  await post.remove();

  // delete the file
  cloudinaryImageId && cloudinary.uploader.destroy(cloudinaryImageId, (result) => console.log(result));

  res.status(200).json({ message: "Post removed" });
});

export const ratePostById = expressAsyncHandler(async (req: ExtendedRequest, res: Response) => {
  const authUserId = req.user._id;
  const postId = req.params.id;

  let post = await Post.findById(req.params.id).populate("user", "_id");

  if (!post) throw new createError.NotFound();

  // check if the post exist

  const isLiked = req.user.likes && post.likes.includes(authUserId);

  var option = isLiked ? "$pull" : "$addToSet";

  // Insert user like
  req.user = await User.findByIdAndUpdate(authUserId, { [option]: { likes: postId } }, { new: true });

  //@ts-ignore
  if (!isLiked && req.user._id.toString() !== post.user._id.toString()) {
    const data = {
      userFrom: req.user._id,
      notificationType: "like",
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
  }

  post = await Post.findByIdAndUpdate(postId, { [option]: { likes: authUserId } }, { new: true });

  // add notification
  res.status(200).json(post);
});
