const express = require("express");
const {
  createUser,
  getUsers,
  updateUser,
  getUser,
  deleteUser,
  uploadUserImage,
  resizeUserImage,
  updateUserPassword,
  applyUserIdToReqParamsIdInGetUserData,
  updateLoggedInUserPassword,
  updateUserDataWithoutPasswordAndRole,
  deactivateMyAccount,
  activateMyAccount,
} = require("../services/userService");
const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  updateUserPasswordValidator,
  updateLoggedInUserPasswordValidator,
  updateLoggedInUserDataValidator,
} = require("../utils/validators/userValidator");
const {
  protect,
  allowedTo,
  protectActivateMyAccount,
} = require("../services/authService");

const router = express.Router();

// --------------------------------// for user //-------------------
router.get("/me", protect, applyUserIdToReqParamsIdInGetUserData, getUser);

router.put(
  "/update-my-password",
  protect,
  updateLoggedInUserPasswordValidator,
  updateLoggedInUserPassword,
);

router.put(
  "/update-my-data",
  protect,
  uploadUserImage,
  resizeUserImage,
  updateLoggedInUserDataValidator,
  updateUserDataWithoutPasswordAndRole,
);

router.put("/activate-my-account", protectActivateMyAccount, activateMyAccount);

router.delete("/deactivate-my-account", protect, deactivateMyAccount);

// --------------------------------// for admin //-------------------
router.use(protect, allowedTo("admin"));

router
  .route("/")
  .post(uploadUserImage, resizeUserImage, createUserValidator, createUser)
  .get(getUsers);

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeUserImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

router.put(
  "/change-password/:id",
  updateUserPasswordValidator,
  updateUserPassword,
);

module.exports = router;
