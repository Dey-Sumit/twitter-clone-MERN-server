import { login, logout, me, signup } from "@controllers/auth.controller";
import express from "express";

const router = express.Router();

//TODO handle server side validation
router.get("/me", me);
router.post("/signup", signup);
router.post("/login", login);
router.delete("/logout", logout);

export default router;
