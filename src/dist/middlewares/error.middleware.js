"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
// any error thrown by the process *eg throw new Error("blah") will not go to the function as it has 3 params instead it will go to the errorHandler (4 params) function
//https://expressjs.com/en/guide/error-handling.html
function notFound(req, res, next) {
    const error = new Error(`NOT Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}
exports.notFound = notFound;
// This error handling middleware has 4 parameters , error is the first one
function errorHandler(err, req, res, next //  because next is not used,don't omit that, else it will not work:) I spend my entire day to debug this
) {
    let message;
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    if (err.name == "CastError")
        message = "Invalid resource Id";
    else
        message = err.message;
    res.status(statusCode);
    // console.log("here");
    // if (err.kind === "ObjectId")
    //     return res.status(404).json({ msg: "Post not found" });
    // console.error(process.env.NODE_ENV === "production" ? "🍰" : err.stack);
    res.json({
        message,
    });
}
exports.errorHandler = errorHandler;
