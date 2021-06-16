import passport from "@middlewares/passport.middleware";
import { login, logout, me, signup } from "controllers/auth.controller";
import express from "express";

const router = express.Router();

router.get("/me", me);
router.post("/signup", signup);
router.post("/login", passport.authenticate("local"), login);
router.delete("/logout", logout);

export default router;
