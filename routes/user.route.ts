import {
  deleteUserById,
  getFollowersById,
  getFollowingsById,
  getUserById,
  searchUser,
  updateUserById,
  toggleFollowUser,
} from "@controllers/users.controller";
import authMiddleware from "@middlewares/auth.middleware";
import express from "express";

const router = express.Router();

router.get("/search", searchUser);

router
  .route("/:id")
  .get(getUserById)
  .put(authMiddleware, updateUserById)
  .delete(authMiddleware, deleteUserById);

router.get("/:id/followers", authMiddleware, getFollowersById);
router.get("/:id/followings", authMiddleware, getFollowingsById);

router.post("/:id/follow", authMiddleware, toggleFollowUser);

export default router;
