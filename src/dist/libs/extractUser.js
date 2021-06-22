"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//! this function not needed
const sensitiveFields = ["password"];
function extractUser(user) {
    if (!user)
        return null;
    const obj = {};
    console.log({ user });
    Object.keys(user._doc).forEach((key) => {
        if (!sensitiveFields.includes(key))
            obj[key] = user[key];
    });
    return obj;
}
exports.default = extractUser;
