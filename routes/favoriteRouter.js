const express = require('express');
const Favorite = require('../models/favorite')
const authenticate = require('../authenticate');
const cors = require('./cors');


const favoriteRouter = express.Router();

favoriteRouter.route('/') //endpoint
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) //pre-flighting
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {  //verifying the user 
    Favorite.find({user: req.user._id}) //looking for/finding the users ID
    .populate('user') //mongoose populations (setting this in the schema)
    .populate ('campsites')//mongoose populations (setting this in the schema)
    .then(favorites => {
        if(favorites) { //checking if favorites exists 
            res.statusCode = 200; // OK response status
            res.setHeader('Content-type', 'application/json'); //sets the header (its content)
            res.json(favorites) //returning the favorites 
        } else {
            err = new Error('Not Found'); // error if the favorites don't exist
            err.status = 404;
            return next(err)
        }
        // res.statusCode = 200;
        // res.setHeader('Content-Type', 'application/json');
        // res.json(favorites)
    })
    .catch(err => next(err)) //catching the error and sending it to express
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => { //authentication and cors middleware check
    Favorite.findOne({ user: req.user._id }) //looking for/finding the users ID
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
        // if (favorite) {
        //     req.body.forEach(fave => {
        //         console.log("alex");
        //         console.log(favorite)
        //         if (!favorite.campsites.includes(fave._id)) { //checking if that ID already exists
        //             favorite.campsites.push(fave._id); //pushes it to the array if it doesn't
        //         }
        //     });
        //     favorite.save()
        //     .then(favorite => {
        //         res.statusCode = 200;
        //         res.setHeader('Content-Type', 'application/json');
        //         res.json(favorite);
        //     })
        //     .catch(err => next(err));
        // } else {
        //     console.log("ace")
        //     Favorite.create({ user: req.user._id, campsites: req.body })
        //     .then(favorite => {
        //         res.statusCode = 200;
        //         res.setHeader('Content-Type', 'application/json');
        //         res.json(favorite);
        //     })
        //     .catch(err => next(err));
        // }
        if(favorite){ //checks if favorite exists 
            req.body.forEach(fav => { //using forEach to go through all of the ids
                console.log(fav._id);
                //console.log(fav.id);
                if(!favorite.campsites.includes(fav._id)) { //checking if that ID already exists
                    favorite.campsites.push(fav._id); //pushes it to the array if it doesn't
                }
            });
            favorite.save()
            .then( favorite => { //setting the response 
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite); //sends a JSON response with favorite in it
            })
            .catch(err => next(err));
        } else {
            Favorite.create( { user: req.user._id, campsites: req.body}) //creates a new array if it doesn't exist
            .then( favorite => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite); //sends a JSON response
            })
            .catch(err => next(err)); //sends error to express
        }
    })
    .catch(err => next(err)); //sends error to express
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT is not supported on this path');    
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => { // authentication
    Favorite.findOneAndDelete({user: req.user._id}) //deletes everything in the favorites
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

favoriteRouter.route('/:campsiteId') //endpoints
.options(cors.corsWithOptions, (req, res)=> res.sendStatus(200))
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`Operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id}) //looks for that specific user._id
    .then(favorite => {
        if(favorite) {
            if(!favorite.campsites.includes(req.params.campsiteId)){ //checks if the campsite with that ID exists
                favorite.campsites.push(req.params.campsiteId); //pushes it in the array 
                favorite.save()
                .then(favorite => { // sets response
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
            Favorite.create({ user: req.user._id, campsites : [req.params.campsiteId]}) //creates favorite and stores the campsite by its ID
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
    // Favorite.findByIdAndDelete(req.params.campsiteId)   //NOT WORKING BECAUSE ITS DELETING AN ARRAY AND NOT BY AN INDEX!!
    // .then(favorite => {
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type', 'application/json');
    //     res.json(favorite)
    // })
    // .catch(err => next(err));
    Favorite.findOne({user: req.user._id})  //looks for that specific user._id
    .then(favorite => {
        if(favorite) { //checks if favorites exists
            const index = favorite.campsites.indexOf(req.params.campsiteId) // storing the index into a constant
            if (index > -1) { //checking if the index exists
                favorite.campsites.splice(index, 1) //splices(cuts out) that given index (the one is how many indexes to cut starting with the first argument)
            }
            favorite.save() //saving the changes
            .then(favorite => { //setting response
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(favorite)
            })
            .catch(err => next(err)) //sends error to express server
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('No favorites to delete')
        }
    })
    .catch( err => next(err)) //sends error to express server
})


module.exports = favoriteRouter;