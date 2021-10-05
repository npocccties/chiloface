const express = require('express');
const router = express.Router();
const fs = require('fs');
const face = require('../lib/facemem.js');

const ERROR400 = "cannot detect face";
const ERROR404 = "face not registered";

// parse parameter
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(upload.single('image'));

function newError(code, message) {
  const ret = new Error(message);
  ret.statusCode = code;
  return ret;
}

router.use(function(req, res, next) {
  if (req.get('content-type') === 'application/json') {
    req.body.image = Buffer.from(req.body.image, 'base64');
  } else if (req.file) {
    req.body = JSON.parse(req.body.params);
    req.body.image = req.file.buffer;
  } else {
    return next(newError(400,'invalid request'));
  }
  next();
});

// face detection
router.post('/detect', async function(req, res, next) {
  try {
    const dresult = await face.detect(req);
    const faceRectangle = dresult.map(e => e.faceRectangle);
    res.send({
      faceRectangle,
    });
  } catch(err) {
    err.statusCode = 500;
    next(err);
  }
});

// verify face
router.post('/verify', async function(req, res, next) {
  try {
    const dresult = await face.detect(req);
    const faceRectangle = dresult.map(e => e.faceRectangle);
    if (dresult.length < 1) {
      return next(newError(400,ERROR400));
    }
    const result = await face.verify(req, dresult[0].faceId);
    if (result === null) {
      next(newError(404,ERROR404));
    } else {
      res.send({
        ...result,
        faceRectangle,
      });
    }
  } catch(err) {
    err.statusCode = 500;
    next(err);
  }
});

// register face
router.post('/faces', async function(req, res, next) {
  try {
    const dresult = await face.detect(req);
    const faceRectangle = dresult.map(e => e.faceRectangle);
    if (dresult.length < 1) {
      return next(newError(400,ERROR400));
    }
    face.registerFace(req, dresult[0].faceId);
    res.status(201).send({
      faceRectangle,
    });
  } catch(err) {
    err.statusCode = 500;
    next(err);
  }
});

function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  try {
    res.setHeader('content-type', "text/plain");
    res.status(err.statusCode).send(err.message);
  } catch(err) {
    next(err);
  }
}

module.exports = {
  router,
  errorHandler,
};
