var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const config = require('./config');
const passport = require('passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const partnerRouter = require('./routes/partnerRouter');
const promotionRouter = require('./routes/promotionRouter');
const uploadRouter = require('./routes/uploadRouter');
const favoriteRouter = require('./routes/favoriteRouter')

//Structure for database and for querying the database
//Automation of queries or all HTTP verb requests
const mongoose = require('mongoose');

const url = config.mongoUrl; 

const connect = mongoose.connect(url, { //not to throw warnings 
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});


var app = express();

app.all("*", (req, res, next) => {
    if(req.secure){
      return next();
    } else {
      console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
      res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
  }
})


connect.then(() => console.log('Connected correctly to server'), 
    err => console.log(err)
);

// view engine setup
//your static files//front end client
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321')); //Parses cookies


app.use(passport.initialize());
//app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// function auth(req, res, next) {
//   console.log(req.user);

//       if (!req.user) {
//         const err = new Error('You are not authenticated!');
//         err.status = 401;
//         return next(err);
//     } else {
//         return next();
//       } 
//   }


//app.use(auth);

app.use(express.static(path.join(__dirname, 'public'))); //directory for static files


app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favoriteRouter)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// catch 404 and forward to error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
