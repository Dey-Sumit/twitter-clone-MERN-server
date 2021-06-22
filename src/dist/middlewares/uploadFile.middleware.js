"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const uploadFile = () => {
    const checkFileType = (file, cb) => {
        console.log({ file });
        const fileTypes = /jpg|jpeg|png/;
        const extname = fileTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        else {
            cb(new Error("Images Only"));
        }
    };
    const storage = multer_1.default.diskStorage({});
    return multer_1.default({
        storage,
        fileFilter: (req, file, cb) => {
            checkFileType(file, cb);
        },
    });
};
exports.default = uploadFile;
