const multer = require("multer");
const ApiError = require("../utils/apiError");

const multerOptions = () => {
  const storage = multer.memoryStorage();

  function fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Only images are allowed"), false);
    }
  }

  const upload = multer({ storage, fileFilter });
  return upload;
};

/**
 * @desc    upload single image
 * @params  fieldName
 * @return  upload image
 */
exports.uploadSingleImg = (fieldName) => multerOptions().single(fieldName);
exports.uploadMultipleImgs = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);
