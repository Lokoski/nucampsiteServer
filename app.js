var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const partnerRouter = require('./routes/partnerRouter');
const promotionRouter = require('./routes/promotionRouter');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

var app = express();

//Structure for database and for querying the database
//Automation of queries or all HTTP verb requests
const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nucampsite'; //Creating or using a database refer to last forward slash
const connect = mongoose.connect(url, { //not to throw warnings 
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

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

app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}))

app.use('/', indexRouter);
app.use('/users', usersRouter);

function auth(req, res, next) {
  console.log(req.session);

      if (!req.session.user) {
        const err = new Error('You are not authenticated!');
        err.status = 401;
        return next(err);
    } else {
        if (req.session.user === 'authenticated') {
            return next();
        } else {
            const err = new Error('You are not authenticated!');
            err.status = 401;
            return next(err);
      }
  }
}


app.use(auth);

app.use(express.static(path.join(__dirname, 'public'))); //directory for static files


app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);
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
