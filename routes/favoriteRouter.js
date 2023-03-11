const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");
const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("campsites")
      .then(favorites => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      })
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then(favorite => {
      if (favorite) {
        // add favorite campsites id's if they arent there
        req.body.forEach(campsiteObj => {
          if (
            !favorite.campsites.find(dbCampsiteId =>
              dbCampsiteId.equals(campsiteObj._id)
            )
          ) {
            favorite.campsites.push(campsiteObj._id);
          }
        });
        favorite
          .save()
          .then(favorite => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          })
          .catch(err => next(err));
      } else {
        // create a favorite for this user and then add all campsite id's
        Favorite.create({
          user: req.user._id,
          campsites: req.body.map(campsiteObj => campsiteObj._id),
        })
          .then(favorite => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          })
          .catch(err => next(err));
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {})
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then(favorite => {
        if (favorite) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        } else {
          res.statusCode = 400;
          res.end("You do not have any favorites to delete.");
        }
      })
      .catch(err => next(err));
  });

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {})
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const campsiteId = req.params.campsiteId;
    Favorite.findOne({ user: req.user._id }).then(favorite => {
      if (favorite) {
        // add favorite campsites id's if they arent there
        if (
          !favorite.campsites.find(dbCampsiteId =>
            dbCampsiteId.equals(campsiteId)
          )
        ) {
          favorite.campsites.push(campsiteId);
        }
        favorite
          .save()
          .then(favorite => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          })
          .catch(err => next(err));
      } else {
        // create a favorite for this user and then add all campsite id's
        Favorite.create({
          user: req.user._id,
          campsites: [campsiteId],
        })
          .then(favorite => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          })
          .catch(err => next(err));
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {})
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const campsiteId = req.params.campsiteId;
    Favorite.findOne({ user: req.user._id })
      .then(favorite => {
        if (favorite) {
          // add favorite campsites id's if they arent there
          const index = favorite.campsites.indexOf(dbCampsiteId =>
            dbCampsiteId.equals(campsiteId)
          );
          if (index > -1) {
            favorite.campsites.splice(index, 1);
            favorite
              .save()
              .then(favorite => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              })
              .catch(err => next(err));
          } else {
            res.statusCode = 400;
            res.end("This favorite does not exist.");
          }
        } else {
          throw new Error("user not found in favorites");
        }
      })
      .catch(err => next(err));
  });

module.exports = favoriteRouter;
