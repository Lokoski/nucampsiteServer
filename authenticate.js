const passport = require('passport'); //Middleware that consists of Strategies that is used to implement an algorithm for a specific task
const LocalStrategy = require('passport-local').Strategy; //Importing the passport-local middleware. A strategy to authenticate username and password
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;//Import a middleware and use its strategy
const ExtractJwt = require('passport-jwt').ExtractJwt; //Extracting JWT token when sent
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const FacebookTokenStrategy = require('passport-facebook-token');

const config = require('./config.js'); //Configuration file for your secret key and database

exports.local = passport.use(new LocalStrategy(User.authenticate())); //This strategy will extract the incoming req which will be username and password

passport.serializeUser(User.serializeUser()); //Determines which data of the user object to be stored in a session
passport.deserializeUser(User.deserializeUser()); // Corresponds to the key of the users object to retrieve the whole data object

//Signing a token or creating a new token for a a user
exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};


// Data structure to store information based of a key-value pair
const opts = {}; //JSON object

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //how to extract the token and its send in the header
opts.secretOrKey = config.secretKey; //Encryption of JWT

//Checking to see if a User already has a JWT token.
exports.jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            console.log('JWT payload:', jwt_payload);
            //finds user document from jwt payload
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) {
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else { 
                    return done(null, false);
                }
            });
        }
    )
);

//A middleware that returns req.user to authenticate if the user exists //user is still in session/token
exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) { // we are verifying if it is the admin making the requests
    } else {
        err = new Error("Not Authorized!");
        err.status = 403;
        return next(err);
    }
}

exports.facebookPassport = passport.use(
    new FacebookTokenStrategy(
        {
            clientID: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret
        }, 
        (accessToken, refreshToken, profile, done) => {
            User.findOne({facebookId: profile.id}, (err, user) => {
                if (err) {
                    return done(err, false);
                }
                if (!err && user) {
                    return done(null, user);
                } else {
                    user = new User({ username: profile.displayName });
                    user.facebookId = profile.id;
                    user.firstname = profile.name.givenName;
                    user.lastname = profile.name.familyName;
                    user.save((err, user) => {
                        if (err) {
                            return done(err, false);
                        } else {
                            return done(null, user);
                        }
                    });
                }
            });
        }
    )
);