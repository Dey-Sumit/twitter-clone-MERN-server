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
exports.getFollowingsById = exports.getFollowersById = exports.toggleFollowUser = exports.updateUserById = exports.deleteUserById = exports.getUserById = exports.searchUser = exports.getTopUsersByFollowers = void 0;
const cloudinary_1 = require("cloudinary");
const http_errors_1 = __importDefault(require("http-errors"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("@models/User"));
const Post_1 = __importDefault(require("@models/Post"));
exports.getTopUsersByFollowers = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User_1.default.aggregate([
        {
            $project: {
                // TODO refactor coz I have a virtual field,can be better
                noOfFollowers: { $size: "$followers" },
                // posts: 1,
                username: 1,
                profilePicture: 1,
            },
        },
        { $sort: { noOfFollowers: -1 } },
        { $limit: 10 },
    ]);
    // const tags = await Tag.find({}).sort({ totalPosts: -1 }).limit(5);
    return res.status(200).json(users);
}));
exports.searchUser = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const q = (_b = (_a = req.query) === null || _a === void 0 ? void 0 : _a.q) === null || _b === void 0 ? void 0 : _b.toString();
    if (!q)
        throw new http_errors_1.default.BadRequest("pass the keyword");
    const searchObj = {
        $or: [{ name: { $regex: q, $options: "i" } }, { username: { $regex: q, $options: "i" } }],
    };
    const users = yield User_1.default.find(searchObj);
    res.status(200).json(users);
}));
exports.getUserById = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield User_1.default.findById(id);
    if (!user)
        throw new http_errors_1.default.NotFound();
    return res.json(user);
}));
exports.deleteUserById = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.id !== req.user._id.toString())
        throw new http_errors_1.default.Unauthorized();
    const user = yield User_1.default.findById(req.params.id);
    if (!user)
        throw new http_errors_1.default.NotFound();
    yield Post_1.default.deleteMany({ user: user._id });
    yield user.remove();
    res.status(200).json({ msg: "User deleted" });
}));
exports.updateUserById = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // check auth & if it's his/her own profile
    if (req.user._id.toString() !== id)
        throw new http_errors_1.default.Unauthorized();
    const { name, username, bio } = req.body;
    let profilePicture;
    if (req.file) {
        const image = yield cloudinary_1.v2.uploader.upload(req.file.path, {
            width: 512,
            height: 512,
            crop: "fill",
        });
        profilePicture = image.secure_url;
    }
    const oldUser = yield User_1.default.findById(id);
    if (!oldUser)
        throw new http_errors_1.default.NotFound();
    const profileFields = {
        name: name || oldUser.name,
        username: username || oldUser.username,
        bio: bio || oldUser.bio,
        profilePicture: profilePicture || oldUser.profilePicture,
    };
    const user = yield User_1.default.findByIdAndUpdate(id, {
        $set: profileFields,
    }, {
        new: true,
    });
    res.status(200).json(user);
}));
// @ follow request PUT
// @ api/users/:id/follow
// @ private
exports.toggleFollowUser = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { id } = req.params;
    //! 1. add the user to my following list
    // const user = await User.findById(id);
    // if (!user) throw new createError.NotFound();
    // console.log(req.user.following);
    var isFollowing = (_c = req.user) === null || _c === void 0 ? void 0 : _c.following.includes(id);
    console.log(isFollowing);
    var option = isFollowing ? "$pull" : "$addToSet";
    console.log({ option });
    req.user = yield User_1.default.findByIdAndUpdate(req.user._id, {
        [option]: {
            following: id,
        },
    }, { new: true });
    //! 2. add me to the person's followers list
    //60c9fd3b618fd83328742008 auser
    yield User_1.default.findByIdAndUpdate(id, {
        [option]: {
            followers: req.user._id,
        },
    }, { new: true });
    res.json(req.user);
}));
// @ return followers of an user
// @ api/users/:id/followers
// @ public
exports.getFollowersById = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield User_1.default.findById(id).populate("followers");
    if (!user)
        throw new http_errors_1.default.NotFound("User not found");
    const followers = user.followers;
    return res.json(followers);
}));
// @ return followers of an user
// @ api/users/:id/followers
// @ public
exports.getFollowingsById = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield User_1.default.findById(id).populate("followings");
    if (!user)
        throw new http_errors_1.default.NotFound("User not found");
    const followings = user.following; // TODO following or followings
    return res.json(followings);
}));
