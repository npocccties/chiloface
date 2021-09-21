const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const apiv1Router = require('./routes/apiv1');
const face = require('./lib/facemem.js');

const app = express();

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
app.use(face.checkUser);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', apiv1Router);
app.use(faceErrorHandler);

module.exports = app;
