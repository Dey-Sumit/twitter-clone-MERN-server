import { check } from "express-validator";

export const signupValidator = [
  check("username")
    .not()
    .isEmpty()
    .withMessage("Username is Required")
    .isLength({ min: 4 })
    .withMessage("Username length must be at least 4")
    .matches(/^\w+$/, "no special characters are allowed for username"),
  check("name").not().isEmpty().withMessage("Name is Required"),
  check("email").not().isEmpty().withMessage("Name is Required").isEmail().withMessage("Email is not valid"),
  check("password")
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .isLength({ min: 5 })
    .withMessage("Password Length must be at least 6"),
];
