const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/baq-req-err');
const EmailError = require('../errors/email-err');

const { NODE_ENV, JWT_SECRET } = process.env;

const {
  STATUS_200, STATUS_201, MESSAGE_400, MESSAGE_404, MESSAGE_409,
} = require('../utils/constants');

// запрос на получение информации о текущем пользователе
module.exports.getUserInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new NotFoundError(MESSAGE_404));
    }
    return res.status(STATUS_200).json(user);
  } catch (err) {
    return next(err);
  }
};

// запрос на обновление имя и email пользователя
module.exports.updateUserInfo = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true },
    );
    if (!updatedUser) {
      return next(new NotFoundError(MESSAGE_404));
    }
    return res.status(STATUS_200).json(updatedUser);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new BadRequestError(MESSAGE_400));
    }
    return next(err);
  }
};

// запрос на регистрацию
module.exports.createUser = async (req, res, next) => {
  try {
    const {
      name, email, password,
    } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hash,
    });
    return res.status(STATUS_201).json({
      name: newUser.name,
      email: newUser.email,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new BadRequestError(MESSAGE_400));
    }
    if (err.code === 11000) {
      return next(new EmailError(MESSAGE_409));
    }
    return next(err);
  }
};

// запрос на авторизацию
module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
    res.cookie('jwt', token, {
      maxAge: 3600000,
      httpOnly: true,
      sameSite: true,
    });
    return res.send(user);
  } catch (err) {
    return next(err);
  }
};
