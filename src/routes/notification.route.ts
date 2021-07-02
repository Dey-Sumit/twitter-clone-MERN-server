import { getNotifications, markAsRead } from "@controllers/notifications.controller";
import authMiddleware from "@middlewares/auth.middleware";
import express from "express";

const router = express.Router();

router.route("/:id").put(authMiddleware, markAsRead);

router.route("/").get(authMiddleware, getNotifications);

export default router;
