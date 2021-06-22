"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_controller_1 = require("@controllers/auth.controller");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
//TODO handle server side validation
router.get("/me", auth_controller_1.me);
router.post("/signup", auth_controller_1.signup);
router.post("/login", auth_controller_1.login);
router.delete("/logout", auth_controller_1.logout);
exports.default = router;
