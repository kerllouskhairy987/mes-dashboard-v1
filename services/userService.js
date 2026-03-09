const asyncHandler = require("express-async-handler");
const sharp = require("sharp");

const ApiError = require("../utils/apiError");
const { uploadSingleImg } = require("../middleware/uploadImg");
const { createOne, getAll, getOne, deleteOne } = require("./handlersFactory");
const User = require("../models/userModel");

// add image profile using multer MemoryStorage
exports.uploadUserImage = uploadSingleImg("profileImg");

// middleware for image processing
exports.resizeUserImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const filename = `user-${Date.now()}-${req.file.originalname}`;
    sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${filename}`);

    // save image to DB
    req.body.profileImg = filename;
  }

  next();
});

/**
 * @desc    create new user
 * @route   POST /api/v1/users
 * @access  private/ admin - manager
 */
exports.createUser = createOne(User);

/**
 * @desc    get all user
 * @route   GET /api/v1/users
 * @access  private/ admin - manager
 */
exports.getUsers = getAll(User);

/**
 * @desc    get specific user
 * @route   GET /api/v1/users/:id
 * @access  private/ admin - manager
 */
exports.getUser = getOne(User);

/**
 * @desc    update specific user
 * @route   PUT /api/v1/users/:id
 * @access  private/ admin - manager
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  if (req.body.password) delete req.body.password;
  if (req.body.passwordConfirm) delete req.body.passwordConfirm;

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new ApiError(400, "User not found"));
  }

  res.status(200).json({
    success: true,
    message: "user updated successfully",
    data: user,
  });
});

/**
 * @desc    delete specific user
 * @route   DELETE /api/v1/users/:id
 * @access  private/ admin - manager
 */
exports.deleteUser = deleteOne(User);
