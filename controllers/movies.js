const Movie = require('../models/movie');

const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/baq-req-err');
const AccesError = require('../errors/acces-err');

const {
  STATUS_200, STATUS_201, MESSAGE_400, MESSAGE_403, MESSAGE_404,
} = require('../utils/constants');

// запрос на все сохраненные пользователем фильмы
module.exports.getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({});
    return res.status(STATUS_200).json(movies);
  } catch (err) {
    return next(err);
  }
};

// запрос на создание фильма
module.exports.createMovie = async (req, res, next) => {
  console.log(req.user);
  try {
    const ownerId = req.user._id;

    const {
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      thumbnail,
      movieId,
      nameRU,
      nameEN,
    } = req.body;

    const newMovie = await Movie.create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      thumbnail,
      owner: ownerId,
      movieId,
      nameRU,
      nameEN,
    });
    return res.status(STATUS_201).json({ newMovie });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new BadRequestError(MESSAGE_400));
    }
    return next(err);
  }
};

// запрос на удаление фильма
module.exports.deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params._id);
    if (!movie) {
      return next(new NotFoundError(MESSAGE_404));
    }
    const owner = movie.owner.toHexString();
    if (owner !== req.user._id) {
      return next(new AccesError(MESSAGE_403));
    }
    await movie.remove();
    return res.status(STATUS_200).send(movie);
  } catch (err) {
    if (err.name === 'CastError') {
      return next(new BadRequestError(MESSAGE_400));
    }
    return next(err);
  }
};
