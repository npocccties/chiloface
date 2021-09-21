var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var apiv1Router = require('./routes/apiv1');

var app = express();

function faceErrorHandler (err, req, res, next) {
  try {
    res.setHeader('content-type', "text/plain");
    res.status(err.statusCode).send(err.message);
  } catch(err) {
    next(err);
  }
}

app.use(logger('dev'));
app.use(express.json({ extended: true, limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', apiv1Router);
app.use(faceErrorHandler);

module.exports = app;
