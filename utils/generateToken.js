const jwt = require("jsonwebtoken");

/**
 * @desc    Generate Token
 * @route   POST any route
 * @access  public
 * @return  token
 */
const generateToken = (payload) => {
  const token = jwt.sign(
    { id: payload._id, email: payload.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  return token;
};

module.exports = generateToken;
