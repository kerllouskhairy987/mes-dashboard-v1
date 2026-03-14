const { validationResult } = require("express-validator");

const validationMiddleware = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    if (process.env.NODE_ENV === "development") {
      return res.status(400).send({ errors: result.array() });
    }
    return res.status(400).send({ message: result.array()[0].msg });
  }

  next();
};

module.exports = validationMiddleware;
