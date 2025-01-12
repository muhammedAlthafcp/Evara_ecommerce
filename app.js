var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const {engine}=require('express-handlebars')
const handlebarsdata = require('handlebars')






const fileuploder = require('express-fileupload')
require("dotenv").config();


var db = require('./config/Connection');
// require('./helpers/express-handlebars');

var AdminRouter = require('./routes/Admin');
var UsersRouter = require('./routes/Users');

var app = express();

const hbs = require('hbs');


// Register a Handlebars helper to check if two values are equal
hbs.registerHelper('statusMatch', function (status1, status2) {
    return status1 === status2;
});

handlebarsdata.registerHelper('eq', function(a, b) {
  return a === b;
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


// Middleware
app.use(fileuploder())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    proxy: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

// Routes
app.use('/Admin', AdminRouter);
app.use('/', UsersRouter);


// 404 Error handling
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handling
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
