const { check, validationResult } = require("express-validator");
const User = require("../../models/userModel");
const slugify = require("slugify");
const validationMiddleware = require("../../middleware/validationLayerMiddleware");

/**
 * @desc    validator for create user
 * @route   POST /api/v1/users
 * @access  private/ admin - manager
 */
exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name should have more than 3 characters")
    .trim()
    .custom((val, { req }) => {
      if (!val) return false;
      req.body.slug = slugify(val);
      return true; // to continue if code is not async
    }),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid")
    .trim()
    .toLowerCase()
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        throw new Error("Email already exists");
      }
    }),

  check("phone")
    .optional()
    .trim()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Phone number must belong to Saudi Arabia or Egypt"),

  check("profileImg").optional(),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    )
    .withMessage(
      "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
    )
    .custom((val, { req }) => {
      if (val !== req.body.passwordConfirm) {
        throw new Error("Password and password confirm must be same");
      }
      return true; // to continue if code is not async
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirm is required"),

  check("role")
    .optional()
    .isIn(["admin", "manager", "user"])
    .withMessage("Role must be admin, manager or user"),

  check("active")
    .optional()
    .isBoolean()
    .withMessage("Active must be boolean")
    .default(true),

  // middleware
  validationMiddleware,
];

/**
 * @desc    validator for get specific user
 * @route   GET /api/v1/users/:id
 * @access  private/ admin - manager
 */
exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  validationMiddleware,
];

/**
 * @desc    validator for update specific user
 * @route   PUT /api/v1/users/:id
 * @access  private/ admin - manager
 */
exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),

  check("name")
    .optional()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name should have more than 3 characters")
    .trim()
    .custom((val, { req }) => {
      if (!val) return false;
      req.body.slug = slugify(val);
      return true; // to continue if code is not async
    }),

  check("email")
    .optional()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid")
    .trim()
    .toLowerCase()
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        throw new Error("Email already exists");
      }
    }),

  check("phone")
    .optional()
    .trim()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Phone number must belong to Saudi Arabia or Egypt"),

  check("profileImg").optional(),

  check("role")
    .optional()
    .isIn(["admin", "manager", "user"])
    .withMessage("Role must be admin, manager or user"),

  check("active")
    .optional()
    .isBoolean()
    .withMessage("Active must be boolean")
    .default(true),

  validationMiddleware,
];

/**
 * @desc    validator for delete specific user
 * @route   DELETE /api/v1/users/:id
 * @access  private/ admin - manager
 */
exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  validationMiddleware,
];
