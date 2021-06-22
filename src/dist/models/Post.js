"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        // User ? not "User"
        ref: "User",
    },
    // change this to text
    content: {
        type: String,
        required: true,
    },
    attachmentURL: {
        type: String,
    },
    cloudinaryImageId: {
        type: String,
    },
    // parentPost: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Post",
    //   default: null, // null means no parent post
    // },
    // array of user objects which only holds userId
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    comments: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
            content: {
                type: String,
                required: true,
            },
            date: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    tags: [
        {
            type: Schema.Types.ObjectId,
            ref: "Tag",
        },
    ],
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("Post", PostSchema);
