import { ExtendedRequest, IPost, ITag } from "libs/types";
import { NextFunction, Response } from "express";
import { Post, Tag, User } from "models";
import { v2 as cloudinary } from "cloudinary";
import { Types } from "mongoose";
import expressAsyncHandler from "express-async-handler";
import { addPostToTag, addTagToPost } from "@services/post.service";
// @desc get user feed posts
// @route GET /api/posts/feed
// @access private

export const getFeedByUserId = expressAsyncHandler(
  async (req: ExtendedRequest, res) => {
    const user = await User.findById(req.query.id);
    // TODO REVIEW this request
    const { page } = req.query;
    const pageSize = 10;
    const pageNumber = Number(page) || 0;

    let posts: IPost[];

    posts = await Post.find({
      $or: [
        { user: { $in: user.following } },
        { user: req.query.id as string },
      ],
    });
    //TODO FIX THIS : better approach we have to repeat the query

    const count = posts.length;

    posts = await Post.find({
      $or: [
        { user: { $in: user.following } },
        { user: req.query.id as string },
      ],
    })
      .limit(pageSize)
      .skip(pageSize * pageNumber)
      // .populate("user", "username") // ERROR in selecting specific fields
      .populate("tags", "name")
      .populate("user")
      .sort("-createdAt");

    return res.json({
      posts: posts,
      page: pageNumber,
      pages: Math.ceil(count / pageSize) - 1,
    });
  }
);

// @desc create post
// @route POST /api/posts
// @access private

export const createPost = expressAsyncHandler(
  async (req, res, next: NextFunction) => {
    const { content, tags }: { content: string; tags?: string } = req.body;

    const tagsArray = tags && [...new Set(tags.split(","))]; // convert to an array and remove duplicates if the tags are present

    if (!content) return res.status(400).json({ msg: "content is required" });

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
    //TODO  create separate function
    if (tags) {
      await Promise.all(
        tagsArray.map(async (tagName) => {
          try {
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
          } catch (error) {
            // TODO fix this try catch ; do  I need this
            next(error.message);
          }
        })
      );
    }
    return res.status(200).json(post);
  }
);

// @desc get all posts | :uid-> get all posts by user id (PAGINATED)
// @route POST /api/posts
// @access public

export const getPosts = expressAsyncHandler(async (req, res) => {
  const { uid, page } = req.query;

  const pageSize = 10;
  const pageNumber = Number(page) || 0;

  let posts: IPost[];

  // check if the uid is passed then return posts of that user
  let allPosts: IPost[], count: number;

  if (uid) {
    //TODO FIX the DUPLICATION, create a service to generate feed :) or something like that
    allPosts = await Post.find({ user: uid.toString() });
    count = allPosts.length;

    posts = await Post.find({ user: uid.toString() })
      .limit(pageSize)
      .skip(pageSize * pageNumber)
      .populate("user")
      .populate("tags")
      .sort("-createdAt");
    return res.json({
      posts,
      page: pageNumber,
      pages: Math.ceil(count / pageSize) - 1,
    });
  }

  // if not user, then return all the posts with pagination
  count = await Post.estimatedDocumentCount();

  posts = await Post.find({})
    .limit(pageSize)
    .skip(pageSize * pageNumber)
    .populate("tags", "name")
    .populate("user")
    .sort("-createdAt");
  return res.json({
    posts,
    page: pageNumber,
    pages: Math.ceil(count / pageSize) - 1,
  });
  // return res.json(posts);
});

// @ route GET api/posts/:id
// @ desc get  post by id
// @ access private

export const getPostById = expressAsyncHandler(async (req, res) => {
  //   console.log(req.params);

  const { id } = req.query; // use req.params in express
  // try {
  const post = await Post.findById(id)
    .populate("user")
    // .populate("likes.user") // if you want to show the users who liked the post
    .populate("comments.user")
    .populate("tags", "name");

  if (!post) return res.status(404).json({ msg: "Post not found" }); // TODO is it unnecessary , can we use the error middleware
  return res.status(200).json(post);
  // } catch (error) {
  //   console.log(error.message);

  //   if (error.kind === "ObjectId")
  //     return res.status(404).json({ msg: "Post not found" });
  //   res.status(500).json({ msg: "server error" });
  // }
});

// @ route DELETE api/posts/:id
// @ desc delete post by id
// @ access private

export const deletePostById = expressAsyncHandler(async (req, res) => {
  const post = await Post.findById(req.query.id);

  if (!post) return res.status(404).json({ msg: "Post not found" });

  if (post.user.toString() !== req.user._id.toString()) {
    return res
      .status(401)
      .json({ msg: " user not authorized; seems like it's not your post" });
  }
  console.log({ post });
  const cloudinaryImageId = post.cloudinaryImageId;
  await post.remove();
  // do not need to make this async
  console.log({ cloudinaryImageId });

  cloudinaryImageId &&
    cloudinary.uploader.destroy(cloudinaryImageId, (result) =>
      console.log(result)
    );
  res.status(200).json({ msg: "Post removed" });
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

export const ratePostById = async (req, res) => {
  const authUserId = req.user._id as Types.ObjectId;

  const post = await Post.findById(req.query.id);

  const { rate }: { rate: Number } = req.body;

  if (rate !== 1 && rate !== 0) {
    return res.status(400).json({ msg: "Invalid rating" });
  }

  if (rate === 1) {
    // check if the post has already been liked
    if (
      post.likes.filter(
        (like) => like.user.toString() === authUserId.toHexString()
      ).length > 0
    ) {
      return res.status(400).json({ msg: "Post already liked by the user" });
    }
    post.likes.unshift({ user: authUserId });
  } else {
    if (
      post.likes.filter(
        (like) => like.user.toString() === authUserId.toHexString()
      ).length === 0
    ) {
      return res.status(400).json({ msg: "Post is not yet liked by the user" });
    } else {
      // get remove index
      const removeIndex = post.likes
        .map((like) => like.user)
        .indexOf(authUserId);

      post.likes.splice(removeIndex, 1);
    }
  }
  await post.save();
  res.status(200).json({ post });
};
