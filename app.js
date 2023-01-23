const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// const { celebrate, Joi } = require('celebrate');

const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/users');
const movieRouter = require('./routes/movies');

const { checkAuth } = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const NotFoundError = require('./errors/not-found-err');

const { MESSAGE_404 } = require('./utils/constants');

// const { createUser, login } = require('./controllers/users');

const { PORT = 3000 } = process.env;

const app = express();

app.use(cookieParser());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/bitfilmsdb');

app.use(requestLogger);

// запросы на регистрацию и авторизацию
app.use(authRouter);

// запрос на выход
app.get('/signout', (req, res) => {
  res.clearCookie('jwt').json({ message: 'Куки очищены' });
});

// защта роутов авторизацией
app.use(checkAuth);

app.use(userRouter);

app.use(movieRouter);

app.use('*', (req, res, next) => {
  next(new NotFoundError(MESSAGE_404));
});

app.use(errorLogger);

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({
    message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
  });

  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
