"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("@models/User"));
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
    },
    username: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
    },
    profilePicture: {
        type: String,
        default: "https://images.vexels.com/media/users/3/145908/preview2/52eabf633ca6414e60a7677b0b917d92-male-avatar-maker.jpg",
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    // people follow this user
    followers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    // people this user follow
    following: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    posts: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Post",
        },
    ],
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Post" }],
}, {
    id: false,
    timestamps: true,
    toObject: {
        virtuals: true,
    },
    toJSON: {
        virtuals: true,
    },
});
// UserSchema.set("toObject", { virtuals: true });
// UserSchema.set("toJSON", { virtuals: true });
// Virtual
UserSchema.virtual("noOfFollowers").get(function () {
    var _a;
    return (_a = this.followers) === null || _a === void 0 ? void 0 : _a.length;
});
UserSchema.virtual("noOfFollowing").get(function () {
    var _a;
    return (_a = this.following) === null || _a === void 0 ? void 0 : _a.length;
});
UserSchema.virtual("noOPosts").get(function () {
    var _a;
    return (_a = this.posts) === null || _a === void 0 ? void 0 : _a.length;
});
// methods
UserSchema.methods.checkPassword = function (enteredPassword, done) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield User_1.default.findOne({ username: this.username }).select("password");
        return yield bcryptjs_1.default.compare(enteredPassword, user.password);
    });
};
// middleware before saving the data
// hash the password during registration
UserSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // run oly if the password field is modified (ex: during update profile)
        if (!this.isModified("password")) {
            next();
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        this.password = yield bcryptjs_1.default.hash(this.password, salt);
    });
});
// UserSchema.pre("deleteOne", async function (next) {
//   console.log("removing");
//   mongoose
//     .model("Post")
//     .deleteMany(
//       {
//         user: this._id,
//       },
//       (err) => console.log(err)
//     )
//     .exec();
//   next();
// });
//? Fix this type
exports.default = mongoose_1.default.model("User", UserSchema);
// cascading
