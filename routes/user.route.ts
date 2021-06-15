import {
  deleteUserById,
  followUser,
  getFollowersById,
  getFollowingsById,
  getUserById,
  searchUserByUsername,
  unfollowUser,
  updateUserById,
} from "@controllers/users.controller";
import authMiddleware from "@middlewares/auth.middleware";
import express from "express";

const router = express.Router();

router.get("/search", searchUserByUsername);
router.get("/:id", getUserById);
router.put("/:id", authMiddleware, updateUserById);
router.delete("/:id", authMiddleware, deleteUserById);
router.get("/:id/followers", getFollowersById);
router.get("/:id/followings", getFollowingsById);
router.post("/:id/follow", followUser);
router.post("/:id/unfollow", unfollowUser);

export default router;
