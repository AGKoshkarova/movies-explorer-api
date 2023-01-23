const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { errors } = require('celebrate');

const router = require('./routes/index');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const { findErrors } = require('./middlewares/errors');

const { PORT = 3000 } = process.env;

const app = express();

app.use(helmet());

app.use(cookieParser());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/bitfilmsdb');

app.use(requestLogger);

// подключение роутов
app.use(router);

app.use(errorLogger);

app.use(errors());

// централизованный обработчик ошибок
app.use(findErrors);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
