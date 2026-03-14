const { check } = require("express-validator");
const bcrypt = require("bcryptjs");

const slugify = require("slugify");
const validationMiddleware = require("../../middleware/validationLayerMiddleware");
const User = require("../../models/userModel");
const ApiError = require("../apiError");

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
 * @desc    validation layer for login user
 * @route   POST /api/v1/auth/login
 * @access  public
 */
exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid")
    .trim()
    .toLowerCase()
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (!user) {
        throw new Error("This Account Not Found, Please Create Account First");
      }
    }),

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

  validationMiddleware,
];

/**
 * @desc     update logged in user password
 * @route    PUT /api/v1/users/update-my-password
 * @access   private/ protect
 */
exports.updateUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid user ID format"),

  check("currentPassword")
    .notEmpty()
    .withMessage("currentPassword is required")
    .custom(async (val, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("User not found");
      }

      const hash = user.password;
      const isMatch = await bcrypt.compare(val, hash);
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }
    }),

  check("password")
    .notEmpty()
    .withMessage("password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/,
    )
    .withMessage(
      "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
    )
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new ApiError(
          400,
          "password and passwordConfirm must be the same",
        );
      }
      return true; // to continue
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("passwordConfirm is required"),

  validationMiddleware,
];

/**
 * @desc     update logged in user password [only for logged in user]
 * @route    PUT /api/v1/users/update-my-password
 * @access   private/ protected
 */
exports.updateLoggedInUserPasswordValidator = [
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/,
    )
    .withMessage(
      "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
    )
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new ApiError(
          400,
          "password and passwordConfirm must be the same",
        );
      }
      return true; // to continue
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("passwordConfirm is required"),

  validationMiddleware,
];

/**
 * @desc     update logged in user data [no update password or role]
 * @route    PUT /api/v1/users/update-my-data
 * @access   private/ protected
 */
exports.updateLoggedInUserDataValidator = [
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

/**
 * @desc    validator for reset password [step 3 from 3]
 * @route   POST /api/v1/auth/reset-password
 * @access  public
 */
exports.resetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid")
    .trim()
    .toLowerCase()
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (!user) {
        throw new ApiError(404, "User not found");
      }
    }),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    )
    .withMessage(
      "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
    )
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new ApiError(400, "Passwords do not match");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirm is required"),

  validationMiddleware,
];
