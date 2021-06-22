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
exports.addPostToTag = exports.addTagToPost = void 0;
const Post_1 = __importDefault(require("@models/Post"));
const Tag_1 = __importDefault(require("@models/Tag"));
const addTagToPost = (post, tag) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Post_1.default.findByIdAndUpdate(post._id, {
        $push: {
            //@ts-ignore
            tags: tag._id,
        },
    }, {
        new: true,
    }).populate("tags", "name");
});
exports.addTagToPost = addTagToPost;
const addPostToTag = (tag, post) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Tag_1.default.findByIdAndUpdate(tag._id, {
        $push: {
            //@ts-ignore
            posts: post._id,
            $inc: { totalPosts: 1 }, // TODO dec totalPosts when the post is deleted
        },
    }, {
        new: true,
    });
});
exports.addPostToTag = addPostToTag;
