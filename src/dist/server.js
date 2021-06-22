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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cloudinary_1 = require("cloudinary");
const auth_route_1 = __importDefault(require("@routes/auth.route"));
const user_route_1 = __importDefault(require("@routes/user.route"));
const post_route_1 = __importDefault(require("@routes/post.route"));
const tag_route_1 = __importDefault(require("@routes/tag.route"));
const connectDB_1 = __importDefault(require("@config/connectDB"));
const error_middleware_1 = require("@middlewares/error.middleware");
const passport_middleware_1 = __importDefault(require("@middlewares/passport.middleware"));
const session_middleware_1 = __importDefault(require("@middlewares/session.middleware"));
dotenv_1.default.config();
const PORT = process.env.PORT || 4000;
const app = express_1.default();
app.use(morgan_1.default("dev"));
app.use(cors_1.default({
    origin: "http://localhost:3000",
    credentials: true,
}));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(session_middleware_1.default);
app.use(passport_middleware_1.default.initialize());
app.use(passport_middleware_1.default.session());
app.use("/api/auth", auth_route_1.default);
app.use("/api/posts", post_route_1.default);
app.use("/api/users", user_route_1.default);
app.use("/api/tags", tag_route_1.default);
app.use(error_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    yield connectDB_1.default();
    console.log(`Server is running on port ${PORT}`);
}));
