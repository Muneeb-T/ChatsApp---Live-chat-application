var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var session = require('express-session');
var fileUpload = require('express-fileupload')
var database = require('./database/connection')
var socket_api = require("./socket/socket_api"); 

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


var app = express()

const handlebars = hbs.create({
  extname: 'hbs',
  defaultLayout: 'layout',
  partialsDir: __dirname + '/views/partials',
  layoutsDir: __dirname + '/views/layout',
  helpers: {
    uppercase: (value) => {
      return (value + "").toUpperCase()
    },
    json: (context) => {
      return JSON.stringify(context);
    }
  }
})

database.connect((err) => {
  if (!err) console.log("Database connected succesfully")
  else console.log("Database connection error")
})

// view engine setup
app.engine('hbs', handlebars.engine)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(fileUpload())
app.use(session({ secret: 'chatsapp123456', cookie: { maxAge: 600000 } }))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app , socket_api;
