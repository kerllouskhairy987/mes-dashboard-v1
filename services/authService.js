const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const generateToken = require("../utils/generateToken");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");

/**
 * @desc      signup user
 * @route     POST /api/v1/auth/signup
 * @access    public
 */
exports.signup = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  // Generate Token
  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: "user created successfully",
    data: user,
    token,
  });
});

/**
 * @desc     login user
 * @route    POST /api/v1/auth/login
 * @access   public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError(400, "Invalid email or password"));
  }

  // Generate Token
  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: "user logged in successfully",
    data: user,
    token,
  });
});

/**
 * @desc    Protect Routes Make Sure That User Logged In (authenticated)
 * @route   POST /api/v1/[anyRoute]
 * @access  private / admin - manager
 */
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) check token exists? if exist get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token || token === "null") {
    return next(
      new ApiError(
        401,
        "You are not logged in, please log in first to get access",
      ),
    );
  }

  // 2) verify token (invalid - expired)
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // 3) check if user exists or not active
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new ApiError(
        401,
        "The user belonging to this token does no longer exist, please log in again",
      ),
    );
  }
  // check user is active or not
  if (!user.active) {
    return next(
      new ApiError(
        401,
        "User is not active, please login first and then activate your account or contact admin",
      ),
    );
  }

  // 4) check if password is changed after token is generated or not if changed you must login again
  if (user.passwordChangedAt) {
    const changedTimestamp = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10,
    );
    // password changed after token is generated
    if (decoded.iat < changedTimestamp) {
      return next(
        new ApiError(401, "User recently changed password, please login again"),
      );
    }
  }

  req.user = user; // use it in authorization
  next();
});

/**
 * @desc    Protect Route Make Sure That User Logged In (authorization) for activate my account
 * @route   POST /api/v1/auth/activate-my-account
 * @access  private/ protected
 */
exports.protectActivateMyAccount = asyncHandler(async (req, res, next) => {
  // 1) check token exists? if exist get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token || token === "null") {
    return next(
      new ApiError(
        401,
        "You are not logged in, please log in first to get access",
      ),
    );
  }

  // 2) verify token (invalid - expired)
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // 3) check if user exists or not
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new ApiError(
        401,
        "The user belonging to this token does no longer exist, please log in again",
      ),
    );
  }

  // 4) check if password is changed after token is generated or not if changed you must login again
  if (user.passwordChangedAt) {
    const changedTimestamp = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10,
    );
    // password changed after token is generated
    if (decoded.iat < changedTimestamp) {
      return next(
        new ApiError(401, "User recently changed password, please login again"),
      );
    }
  }

  req.user = user; // use it in authorization
  next();
});

/**
 * @desc    check if user is admin or manager (authorization)
 * @route   POST /api/v1/[anyRoute]
 * @access  private / admin - manager
 */
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You do not have permission to perform this action"),
      );
    }

    next();
  });

/**
 * @desc    reset password and send 6 chars to email using nodemailer [step 1 from 3]
 * @route   POST /api/v1/auth/forgot-password
 * @access  public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email address
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ApiError(404, "There is no user with email address"));
  }

  // 2) if user exist Generate hash Random 6 digit code and save it in DB
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // save in db
  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min
  user.passwordResetVerified = false;
  await user.save();

  // 3) Send reset code to user email
  try {
    await sendEmail({
      email: user.email,
      name: user.name,
      subject: "Password Reset Code",
      text: resetCode,
    });
  } catch (error) {
    console.log("ERROR in sending email", error);
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();

    return next(new ApiError(500, "Failed to send email"));
  }

  res.status(200).json({
    success: true,
    message: "Reset code sent to your email, this code will expire in 10 min",
  });
});

/**
 * @desc    verify reset password code [step 2 from 3]
 * @route   POST /api/v1/auth/verify-reset-password-code
 * @access  public
 */
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  // 1) get user depend on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError(400, "Invalid or expired reset code"));
  }

  // 2) reset code is valid and not expired then verify passwordResetVerified to true
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Reset code verified successfully",
  });
});

/**
 * @desc    reset password [step 3 from 3]
 * @route   POST /api/v1/auth/reset-password
 * @access  public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) get user depend on email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ApiError(400, "There is no user with email address"));
  }

  // 2) check if passwordResetVerified is true or not
  if (!user.passwordResetVerified) {
    return next(new ApiError(400, "Please verify your reset code first"));
  }

  // 3) update password
  user.password = req.body.password;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  // for login again after reset password if you want access any protected route must login again
  user.passwordChangedAt = Date.now();
  await user.save();

  // 4) generate token
  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
    token,
  });
});
