const asyncHandler = require("express-async-handler");

/**
 * @desc    create new document
 * @route   POST /api/v1/:model
 */
exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const user = await Model.create(req.body);
    res.status(201).json({
      success: true,
      message: "user created successfully",
      data: user,
    });
  });

/**
 * @desc    get all documents
 * @route   GET /api/v1/:model
 */
exports.getAll = (Model) =>
  asyncHandler(async (req, res) => {
    const users = await Model.find();
    res.status(200).json({
      success: true,
      message: "users fetched successfully",
      data: users,
    });
  });

/**
 * @desc    get specific document
 * @route   GET /api/v1/:model/:id
 */
exports.getOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const user = await Model.findById(req.params.id);

    if (!user) {
      return next(new ApiError(400, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: "user fetched successfully",
      data: user,
    });
  });

/**
 * @desc    delete specific document
 * @route   DELETE /api/v1/:model/:id
 */
exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const user = await Model.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new ApiError(400, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: "user deleted successfully",
    });
  });
