const express = require('express');
const router = express.Router();
const fs = require('fs');
const basicAuth = require('basic-auth')

let face;

if (typeof process.env.FACE_DB !== 'undefined') {
  face = require('../lib/facemongo.js');
  (async () => {
    await face.start();
  })();
} else {
  face = require('../lib/facemem.js');
}

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

function parseParam(req, res, next) {
  if (req.get('content-type') === 'application/json') {
    req.body.image = Buffer.from(req.body.image, 'base64');
  } else if (req.file) {
    req.body = JSON.parse(req.body.params);
    req.body.image = req.file.buffer;
  } else {
    return next(newError(400,'invalid request'));
  }
}

// check user
async function checkUser(req, res, next) {
  const credential = basicAuth(req);
  if (typeof credential === 'undefined' || credential.name === '' ){
    res.setHeader('WWW-Authenticate', 'Basic');
    next({
      statusCode: 401,
      message: 'authentication error'
    });
  } else {
    req.user = await face.findUser(credential.name);
    next();
  }
}

// face detection
router.post('/detect', async function(req, res, next) {
  try {
    parseParam(req, res, next);
    const dresult = await face.detect(req.body.image);
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
    parseParam(req, res, next);
    const dresult = await face.detect(req.body.image);
    const faceRectangle = dresult.map(e => e.faceRectangle);
    if (dresult.length < 1) {
      await face.verify(req.user, req.body.image, null);
      return next(newError(400,ERROR400));
    }
    const result = await face.verify(req.user, req.body.image, dresult[0]);
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
    parseParam(req, res, next);
    const info = await face.getUserInfo(req.user);
    if (!info.allow_registration) {
      return next(newError(400,'invalid request'));
    }
    const dresult = await face.detect(req.body.image);
    const faceRectangle = dresult.map(e => e.faceRectangle);
    if (dresult.length < 1) {
      return next(newError(400,ERROR400));
    }
    const status = await face.registerFace(req.user, req.body.image, dresult[0]);
    if (status) {
      res.status(201).send({
        faceRectangle,
      });
    } else {
      return next(newError(404,ERROR404));
    }
  } catch(err) {
    err.statusCode = 500;
    next(err);
  }
});

router.get('/user', async function(req, res, next) {
  try {
    const result = await face.getUserInfo(req.user);
    res.send(result);
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
  checkUser,
  router,
  errorHandler,
};
