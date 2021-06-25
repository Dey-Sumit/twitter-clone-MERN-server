import { login, logout, me, signup } from "@controllers/auth.controller";
import { signupValidator } from "@libs/ValidationSchema";
import express from "express";
import { check } from "express-validator";

const router = express.Router();

router.get("/me", me);
router.post("/signup", signupValidator, signup);
router.post("/login", login);
router.delete("/logout", logout);

export default router;
