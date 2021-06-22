"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const express_session_1 = __importDefault(require("express-session"));
function sessionMiddleware(req, res, next) {
    const options = {
        mongoUrl: process.env.DB_URI,
    };
    return express_session_1.default({
        secret: "123456",
        resave: false,
        saveUninitialized: false,
        store: connect_mongo_1.default.create(options),
    })(req, res, next);
}
exports.default = sessionMiddleware;
// https://stackoverflow.com/questions/32830488/explain-requireconnect-mongosession
// https://stackoverflow.com/questions/40381401/when-to-use-saveuninitialized-and-resave-in-express-session
// https://hoangvvo.com/blog/next-js-and-mongodb-app-1
