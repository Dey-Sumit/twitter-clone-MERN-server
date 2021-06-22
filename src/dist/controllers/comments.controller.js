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
exports.getCommentsByPostId = exports.createComment = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Post_1 = __importDefault(require("@models/Post"));
// @ route POST /api/posts/:id/comments/
// @ desc create comment by postId
// @ access private
exports.createComment = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUserId = req.user._id;
    // TODO remove Types.ObjectId
    const content = req.body.content;
    //TODO change all msg to message
    const post = yield Post_1.default.findById(req.query.id);
    if (!post) {
        return res.status(404).json({ msg: "Post not found" });
    }
    if (!content)
        return res.status(401).json({ msg: "Content is required" });
    const newComment = {
        content: req.body.content,
        user: authUserId,
    };
    // post.comments.unshift(newComment);
    yield post.save();
    const comments = post.populate("comments.user", "username");
    return res.status(200).json(comments);
}));
// @ route GET /api/posts/:id/comments/
// @ desc get comments by postId
// @ access public
exports.getCommentsByPostId = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO FIX THIS , length of undefined in populating fields ; working fine for the post request
    const post = yield Post_1.default.findById(req.query.id).populate("comments.user", "name");
    res.status(200).json(post.comments);
}));
