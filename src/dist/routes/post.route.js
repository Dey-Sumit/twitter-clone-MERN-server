"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const comments_controller_1 = require("@controllers/comments.controller");
const auth_middleware_1 = __importDefault(require("@middlewares/auth.middleware"));
const uploadFile_middleware_1 = __importDefault(require("@middlewares/uploadFile.middleware"));
const posts_controller_1 = require("@controllers/posts.controller");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post("/", auth_middleware_1.default, uploadFile_middleware_1.default().single("attachment"), posts_controller_1.createPost);
router.get("/feed", posts_controller_1.getFeed); // TODO might be a better fit for user route
router.route("/:id").get(posts_controller_1.getPostById).delete(auth_middleware_1.default, posts_controller_1.deletePostById);
router.route("/:id/comments").get(comments_controller_1.getCommentsByPostId).post(auth_middleware_1.default, comments_controller_1.createComment);
router.put("/:id/rate", auth_middleware_1.default, posts_controller_1.ratePostById);
exports.default = router;
