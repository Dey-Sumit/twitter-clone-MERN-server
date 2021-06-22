import { getPostsByTag, getTopTags } from "@controllers/tags.controller";
import express from "express";

const router = express.Router();

router.get("/", getTopTags);
router.get("/:tag", getPostsByTag);

export default router;
