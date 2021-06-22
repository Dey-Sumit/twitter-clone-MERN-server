"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Post_1 = __importDefault(require("@models/Post"));
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const TagSchema = new Schema({
    name: {
        type: String,
        require: true,
    },
    posts: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: Post_1.default,
        },
    ],
    totalPosts: {
        type: Number,
        default: 0,
    },
});
exports.default = mongoose_1.default.model("Tag", TagSchema);
