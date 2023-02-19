const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { createUser, login } = require('../controllers/users');

const { checkAuth } = require('../middlewares/auth');

const userRouter = require('./users');
const movieRouter = require('./movies');

const NotFoundError = require('../errors/not-found-err');
const { MESSAGE_404 } = require('../utils/constants');

router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), createUser);

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), login);

router.get('/signout', (req, res) => {
  res.clearCookie('jwt', {
    sameSite: 'None',
    secure: true,
  }).json({ message: 'Куки очищены' });
});

// router.use(checkAuth, userRouter);

// router.use(checkAuth, movieRouter);

router.use(checkAuth);

router.use('/users', userRouter);

router.use('/movies', movieRouter);

router.use('*', (req, res, next) => {
  next(new NotFoundError(MESSAGE_404));
});

module.exports = router;
