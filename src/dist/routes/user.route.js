"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_controller_1 = require("@controllers/users.controller");
const auth_middleware_1 = __importDefault(require("@middlewares/auth.middleware"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/topUsers", users_controller_1.getTopUsersByFollowers); // change api endpoint name
router.get("/search", users_controller_1.searchUser);
router
    .route("/:id")
    .get(users_controller_1.getUserById)
    .put(auth_middleware_1.default, users_controller_1.updateUserById)
    .delete(auth_middleware_1.default, users_controller_1.deleteUserById);
router.get("/:id/followers", auth_middleware_1.default, users_controller_1.getFollowersById);
router.get("/:id/followings", auth_middleware_1.default, users_controller_1.getFollowingsById);
router.put("/:id/follow", auth_middleware_1.default, users_controller_1.toggleFollowUser);
exports.default = router;
