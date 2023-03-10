const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const { MESSAGE_401 } = require('../utils/constants');
const AuthorizationError = require('../errors/auth-err');

module.exports.checkAuth = (req, res, next) => {
  const token = req.headers.authorization || req.cookies.jwt;

  if (!token) {
    return next(new AuthorizationError(MESSAGE_401));
  }

  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    console.log(err);
    return next(new AuthorizationError(MESSAGE_401));
  }

  req.user = payload;

  return next();
};
