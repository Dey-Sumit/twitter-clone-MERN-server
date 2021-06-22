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
exports.getPostsByTag = exports.getTopTags = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_errors_1 = __importDefault(require("http-errors"));
const Tag_1 = __importDefault(require("@models/Tag"));
// @ route GET /api/tags/
// @ desc returns top 5 tags sorted by number of posts
// @ access public
exports.getTopTags = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tags = yield Tag_1.default.aggregate([
        {
            $project: {
                length: { $size: "$posts" },
                // posts: 1,
                name: 1,
            },
        },
        { $sort: { length: -1 } },
        { $limit: 10 },
    ]);
    // const tags = await Tag.find({}).sort({ totalPosts: -1 }).limit(5);
    return res.status(200).json(tags);
}));
// @ route GET /api/tags/:tag
// @ desc get all posts under a tag
// @ access public
exports.getPostsByTag = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tag } = req.params;
    const data = yield Tag_1.default.find({ name: tag }).populate({
        path: "posts",
        populate: [{ path: "tags", select: "name" }, { path: "user" }],
    });
    if (data.length == 0)
        throw new http_errors_1.default.NotFound("Tag does not exist");
    return res.status(200).json(data[0]);
}));
