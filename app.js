const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { errors } = require('celebrate');
const cors = require('cors');

const router = require('./routes');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const { findErrors } = require('./middlewares/errors');

const { PORT = 3000 } = process.env;

const allowedCors = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://diploma.koshkarova.nomoredomains.rocks',
  'https://api.diploma.koshkarova.nomoredomains.rocks',
];

const corsOptions = {
  origin: allowedCors,
  optionsSuccessStatus: 200,
  credentials: true,
};

const app = express();

app.use(helmet());

app.use(cookieParser());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

// mongoose.set('strictQuery', false);

mongoose.connect('mongodb://localhost::27017/bitfilmsdb');

app.use(requestLogger);

// подключаем CORS
app.use(cors(corsOptions));

// подключение роутов
app.use(router);

app.use(errorLogger);

app.use(errors());

// централизованный обработчик ошибок
app.use(findErrors);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
