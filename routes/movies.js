const movieRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { url } = require('../utils/constants');

const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');

movieRouter.get('/movies', getMovies);

movieRouter.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().regex(url),
    trailerLink: Joi.string().required().regex(url),
    thumbnail: Joi.string().required().regex(url),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovie);

movieRouter.delete('/movies/:_id', celebrate({
  body: Joi.object().keys({
    _id: Joi.string().hex().length(24),
  }),
}), deleteMovie);

module.exports = movieRouter;
