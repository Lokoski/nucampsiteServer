const express = require('express');
const Favorite = require('../models/favorite')
const authenticate = require('../authenticate');
const cors = require('./cors');


const favoriteRouter = express.Router();

favoriteRouter.route('/') //endpoint
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => { 
    Favorite.find({user: req.user._id})
    .populate('user')
    .populate ('campsites')
    .then(favorites => {
        if(favorites) {
            res.statusCode = 200;
            res.setHeader('Content-type', 'application/json');
            res.json(favorites)
        } else {
            err = new Error('Not Found');
            err.status = 404;
            return next(err)
        }
    })
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        // if(favorite) {
        //     if(favorite.campsites.indexOf(favorite._id) === -1) {
        //         favorite.campsites.push(favorite._id)
        //     }
        //     favorite.save()
        //     .then(favorite => {
        //         res.statusCode = 200;
        //         res.setHeader('Content-Type', 'application/json');
        //         res.json(favorite);
        //     })
        //     .catch(err => next(err));
        // } else {
        //     Favorite.create({
        //         user: req.user._id,
        //         campsites: req.body
        //     })
        //     .then(favorite => {
        //         res.statusCode = 200;
        //         res.setHeader('Content-Type', 'application/json');
        //         res.json(favorite);
        //     })
        //     .catch(err => next(err));
        // }
        if (favorite) {
            req.body.forEach(fave => {
                if (!favorite.campsites.includes(fave._id)) {
                    favorite.campsites.push(fave._id);
                }
            });
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        } else {
            Favorite.create({ user: req.user._id, campsites: req.body })
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT is not supported on this path');    
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id})
    .then(favorite => {
        if(favorite){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json')
            res.json(favorite)
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete')
        }
    })
    .catch(err => next(err));
})

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res)=> res.sendStatus(200))
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`Operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id})
    .then(favorite => {
        if(favorite) {
            if(!favorite.campsites.includes(req.params.campsiteId)){
                favorite.campsites.push(req.params.campsiteId);
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                })
                .catch(err => next(err))
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.end('This campsite is already a favorite!')
            }
        } else {
            Favorite.create({ user: req.user._id, campsites : [req.params.campsiteId]})
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(favorite)
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`Operation not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // Favorite.findByIdAndDelete(req.params.campsiteId)
    // .then(favorite => {
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type', 'application/json');
    //     res.json(favorite)
    // })
    // .catch(err => next(err));
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite) {
            const x = favorite.campsites.indexOf(req.params.campsiteId)
            if (x > -1) {
                favorite.campsites.splice(x, 1)
            }
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(favorite)
            })
            .catch(err => next(err))
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('No favorites to delete')
        }
    })
    .catch( err => next(err))
})


module.exports = favoriteRouter;