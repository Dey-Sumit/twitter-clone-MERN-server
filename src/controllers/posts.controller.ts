import { ExtendedRequest, IPost } from "@libs/types";
import { NextFunction, Response } from "express";

import { v2 as cloudinary } from "cloudinary";
import expressAsyncHandler from "express-async-handler";
import { addPostToTag, addTagToPost } from "@services/post.service";
import createError from "http-errors";
import Post from "@models/Post";
import User from "@models/User";
import Tag from "@models/Tag";

// @desc get user feed posts
// @route GET /api/posts/feed
// @access private

export const getFeed = expressAsyncHandler(async (req: ExtendedRequest, res) => {
  let user = req.user;

  const { page } = req.query;
  const pageSize = 10;
  const pageNumber = Number(page) || 0;

  let posts: IPost[];

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

  return res.json({
    posts: posts,
    page: pageNumber,
    pages: Math.ceil(count / pageSize) - 1,
  });
});

// @desc create post
// @route POST /api/posts
// @access private

export const createPost = expressAsyncHandler(
  async (req: ExtendedRequest, res, next: NextFunction) => {
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
    return res.status(200).json(post);
  }
);

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
  return res.status(200).json(post);
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
  cloudinaryImageId &&
    cloudinary.uploader.destroy(cloudinaryImageId, (result) => console.log(result));

  res.status(200).json({ message: "Post removed" });
});

//! not implemented in this project
// @ route PUT api/posts/:id
// @ desc update post by id
// @ access private

// export const updatePostById = async (req,res) => {
//   try {
//     // check auth

//     if (!req.body.content)
//       return res.status(400).json({ msg: "content is required" });

//     const { id } = req.query;

//     // insert post
//     // const post: IPost = {
//     //   userId: req.user.id,
//     //   content: req.body.content,
//     // };
//     // await Post.create(post);
//     // const post = await Post.findById(id);
//     return res.status(200).json({ msg: "Update post is not implemented" });
//   } catch (error) {
//     return res.status(500).send("server error :(");
//   }
// };

// @ route PUT api/posts/:id/rate
// @ desc rate post by id
// @ access private

/**
 * @method PUT
 * @access Private
 * @endpoint api/posts/:id/rate
 */
export const ratePostById = expressAsyncHandler(async (req: ExtendedRequest, res: Response) => {
  const authUserId = req.user._id;
  const postId = req.params.id;

  let post = await Post.findById(req.params.id);

  if (!post) throw new createError.NotFound();

  // check if the post exist

  const isLiked = req.user.likes && post.likes.includes(authUserId);

  var option = isLiked ? "$pull" : "$addToSet";

  // Insert user like
  req.user = await User.findByIdAndUpdate(
    authUserId,
    { [option]: { likes: postId } },
    { new: true }
  );

  post = await Post.findByIdAndUpdate(postId, { [option]: { likes: authUserId } }, { new: true });

  // add notification
  res.status(200).json(post);
});
