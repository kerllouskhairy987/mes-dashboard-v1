const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");

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
 * @desc      get all user
 * @route     GET /api/v1/users
 * @access    private/ admin - manager
 * @features  filter - pagination - search - sort - filter fields
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
 * @desc     update user password
 * @route    PUT /api/v1/users/update-password/:id
 * @access   private/ admin
 */
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true, runValidators: true },
  );

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
    data: user,
  });
});

/**
 * @desc    delete specific user
 * @route   DELETE /api/v1/users/:id
 * @access  private/ admin - manager
 */
exports.deleteUser = deleteOne(User);

/**
 * @desc    apply req.params.id === req.user._id to able to get me [only for logged in user]
 * @route   GET  /api/v1/users/me
 * @access  private / protected
 */
exports.applyUserIdToReqParamsIdInGetUserData = asyncHandler(
  async (req, res, next) => {
    req.params.id = req.user._id;
    next();
  },
);

/**
 * @desc     update logged in user password [only for logged in user]
 * @route    PUT /api/v1/users/update-my-password
 * @access   private/ protected
 */
exports.updateLoggedInUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true, runValidators: true },
  );

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
    data: user,
  });
});

/**
 * @desc     update logged in user data without password or role
 * @route    PUT /api/v1/users/update-my-data
 * @access   private/ protected
 */
exports.updateUserDataWithoutPasswordAndRole = asyncHandler(
  async (req, res, next) => {
    if (req.body && req.body.password) delete req.body.password;
    if (req.body && req.body.passwordConfirm) delete req.body.passwordConfirm;
    if (req.body && req.body.role) delete req.body.role;
    if (req.body && req.body.active) delete req.body.active;

    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(
        new ApiError(404, `user not found with this id ${req.user._id}`),
      );
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  },
);

/**
 * @desc    Deactivate my account [only for logged in user]
 * @route   DELETE /api/v1/users/deactivate-my-account
 * @access  private/ protected
 */
exports.deactivateMyAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { active: false },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!user) {
    return next(
      new ApiError(`user not found with this id ${req.user._id}`, 404),
    );
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});

/**
 * @desc    activate my account [only for logged in user]
 * @route   DELETE /api/v1/users/activate-my-account
 * @access  private/ protected
 */
exports.activateMyAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { active: true },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!user) {
    return next(
      new ApiError(404, `user not found with this id ${req.user._id}`),
    );
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});
