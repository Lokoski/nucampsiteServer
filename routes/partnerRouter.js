const express = require('express');
const Partner = require('../models/partner');
const authenticate = require('../authenticate');

const partnerRouter = express.Router();


partnerRouter.route('/') //Endpoints
.get((req, res, next) => {
    //When using Mongoose it will always return a promise and we must use .than and .catch
    Partner.find() // gets all documents in Partner db in JSON format
    .then(partners => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partners); // sends data to the client / no need for res.end()
    })
    .catch(err => next(err)); // sends the error to the error handler in express
})
.post(authenticate.verifyUser, (req, res, next) => {
    Partner.create(req.body) // creates a new doc and saves it to the server and does schema authentication(??)
    .then(partner => {
        console.log('Partner Created ', partner);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
    })
    .catch(err => next(err));
})
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403; // req is forbidden 
    res.end('PUT operation not supported on /partners');
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Partner.deleteMany() // deletes everything in the partners collection
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

partnerRouter.route('/:partnerId') //This is a URL parameter
.get((req, res, next) => {
    Partner.findById(req.params.partnerId)
    .then(partner => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403; // req is forbidden 
    res.end(`POST operation not supported on /partners/${req.params.partnerId}`); //must match the URL parameter
})
.put(authenticate.verifyUser, (req, res, next) => {
    Partner.findByIdAndUpdate(req.params.partnerId, {
        $set: req.body
    }, { new: true }) // must use to perform/save the update
    .then(partner => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
    })
    .catch(err => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Partner.findByIdAndDelete(req.params.partnerId) // looks for and deletes the partner with the id parsed from the req
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

module.exports = partnerRouter;