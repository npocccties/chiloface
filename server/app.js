const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const apiv1 = require('./routes/apiv1');
const face = require('./lib/facemem.js');

const app = express();

app.use(logger('dev'));
app.use(express.json({ extended: true, limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(face.checkUser);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', apiv1.router);
app.use('/logout', function (req, res) {
  res.sendStatus(401);
});
app.use(apiv1.errorHandler);

module.exports = app;
