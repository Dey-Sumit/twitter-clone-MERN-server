"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tags_controller_1 = require("@controllers/tags.controller");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/", tags_controller_1.getTopTags);
router.get("/:tag", tags_controller_1.getPostsByTag);
exports.default = router;
