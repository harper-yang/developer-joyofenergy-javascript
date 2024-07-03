const CustomError = require("../error/CustomError");

function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err instanceof CustomError) {
    res.status(err.status);
  } else {
    res.status(500);
  }

  res.json({ error: err.message });
}

module.exports = { errorHandler };
