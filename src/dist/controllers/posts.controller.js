"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratePostById = exports.deletePostById = exports.getPostById = exports.getPosts = exports.createPost = exports.getFeed = void 0;
const cloudinary_1 = require("cloudinary");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const post_service_1 = require("@services/post.service");
const http_errors_1 = __importDefault(require("http-errors"));
const Post_1 = __importDefault(require("@models/Post"));
const User_1 = __importDefault(require("@models/User"));
const Tag_1 = __importDefault(require("@models/Tag"));
// @desc get user feed posts
// @route GET /api/posts/feed
// @access private
exports.getFeed = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user = req.user;
    const { page } = req.query;
    const pageSize = 10;
    const pageNumber = Number(page) || 0;
    let posts;
    const option = req.user
        ? {
            $or: [{ user: { $in: user.following } }, { user: user._id }],
        }
        : {};
    posts = yield Post_1.default.find(option);
    const count = posts.length;
    posts = yield Post_1.default.find(option)
        .limit(pageSize)
        .skip(pageSize * pageNumber)
        .populate("user", "username name profilePicture")
        .populate("tags", "name")
        //.populate("user")
        .sort("-createdAt");
    return res.json({
        posts: posts,
        page: pageNumber,
        pages: Math.ceil(count / pageSize) - 1,
    });
}));
// @desc create post
// @route POST /api/posts
// @access private
exports.createPost = express_async_handler_1.default((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, tags } = req.body;
    const tagsArray = tags && [...new Set(tags.split(","))]; // convert to an array and remove duplicates if the tags are present
    if (!content)
        throw new http_errors_1.default.BadRequest("Content is Required");
    // insert post
    let attachmentURL, cloudinaryImageId;
    if (req.file) {
        const image = yield cloudinary_1.v2.uploader.upload(req.file.path);
        attachmentURL = image.secure_url;
        cloudinaryImageId = image.public_id;
    }
    const postDoc = {
        user: req.user._id,
        content: req.body.content,
        attachmentURL,
        cloudinaryImageId,
    };
    let post = yield Post_1.default.create(postDoc);
    // 1 . add the post inside user doc
    yield User_1.default.findByIdAndUpdate(req.user._id, {
        $push: {
            posts: post._id,
        },
    }, {
        new: true,
    });
    //2. add tag to post
    //Promise.all = stackoverflow.com/questions/40140149/use-async-await-with-array-map
    //TODO  create separate function
    if (tags) {
        yield Promise.all(tagsArray.map((tagName) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // check if the tag is already created
                const tag = yield Tag_1.default.findOne({
                    name: tagName,
                });
                //stackoverflow.com/questions/11963684/how-to-push-an-array-of-objects-into-an-array-in-mongoose-with-one-call
                // if created ->find the post and add the tag
                if (tag) {
                    post = yield post_service_1.addTagToPost(post, tag);
                    // add the post under the tag
                    yield post_service_1.addPostToTag(tag, post);
                }
                else {
                    //  if the tag is new then create a new tag
                    const newTag = yield Tag_1.default.create({ name: tagName });
                    // add the tag to the post
                    post = yield post_service_1.addTagToPost(post, newTag);
                    // add the post under the tag
                    yield post_service_1.addPostToTag(newTag, post);
                }
            }
            catch (error) {
                // TODO fix this try catch ; do  I need this
                next(error.message);
            }
        })));
    }
    return res.status(200).json(post);
}));
// @desc get all posts | :uid-> get all posts by user id (PAGINATED)
// @route POST /api/posts
// @access public
//! This controller is not needed , we can do this from feed (no user)
exports.getPosts = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid, page } = req.query;
    const pageSize = 10;
    const pageNumber = Number(page) || 0;
    let posts;
    // check if the uid is passed then return posts of that user
    let allPosts, count;
    if (uid) {
        //TODO FIX the DUPLICATION, create a service to generate feed :) or something like that
        allPosts = yield Post_1.default.find({ user: uid.toString() });
        count = allPosts.length;
        posts = yield Post_1.default.find({ user: uid.toString() })
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
    count = yield Post_1.default.estimatedDocumentCount();
    posts = yield Post_1.default.find({})
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
}));
// @ route GET api/posts/:id
// @ desc get  post by id
// @ access private
exports.getPostById = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // try {
    const post = yield Post_1.default.findById(id)
        .populate("user")
        // .populate("likes.user") // if you want to show the users who liked the post
        .populate("comments.user")
        .populate("tags", "name");
    if (!post)
        throw new http_errors_1.default.NotFound();
    return res.status(200).json(post);
}));
// @ route DELETE api/posts/:id
// @ desc delete post by id
// @ access private
exports.deletePostById = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield Post_1.default.findById(req.params.id);
    if (!post)
        throw new http_errors_1.default.NotFound();
    if (post.user.toString() !== req.user._id.toString())
        throw new http_errors_1.default.Unauthorized();
    const cloudinaryImageId = post.cloudinaryImageId;
    yield post.remove();
    // delete the file
    cloudinaryImageId &&
        cloudinary_1.v2.uploader.destroy(cloudinaryImageId, (result) => console.log(result));
    res.status(200).json({ message: "Post removed" });
}));
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
exports.ratePostById = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUserId = req.user._id;
    const postId = req.params.id;
    let post = yield Post_1.default.findById(req.params.id);
    if (!post)
        throw new http_errors_1.default.NotFound();
    // check if the post exist
    const isLiked = req.user.likes && post.likes.includes(authUserId);
    console.log({ isLiked });
    var option = isLiked ? "$pull" : "$addToSet";
    // Insert user like
    req.user = yield User_1.default.findByIdAndUpdate(authUserId, { [option]: { likes: postId } }, { new: true });
    post = yield Post_1.default.findByIdAndUpdate(postId, { [option]: { likes: authUserId } }, { new: true });
    // add notification
    res.status(200).json(post);
}));
