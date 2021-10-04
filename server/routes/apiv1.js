const express = require('express');
const router = express.Router();
const fs = require('fs');
const face = require('../lib/facemem.js');

const OK200 = "OK";
const ERROR400 = "detect face error";
const ERROR404 = "face not registered";
const ERROR500 = "Internal Server Error";

// parse parameter
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(upload.single('image'));

router.use(function(req, res, next) {
  if (req.get('content-type') === 'application/json') {
    req.body.image = Buffer.from(req.body.image, 'base64');
  } else if (req.file) {
    req.body = JSON.parse(req.body.params);
    req.body.image = req.file.buffer;
  } else {
    const err = new Error('invalid request');
    err.statusCode = 400;
    next(err);
  }
  next();
});

// face detection
router.post('/detect', async function(req, res, next) {
  try {
    const result = await face.detect(req);
    const faceRectangle = result.map(e => e.faceRectangle);
    res.send({
      message: OK200,
      faceRectangle,
    });
  } catch(err) {
    res.status(500).send({message: ERROR500});
  }
});

// verify face
router.post('/verify', async function(req, res, next) {
  try {
    const dresult = await face.detect(req);
    if (dresult.length < 1) {
      res.status(400).send({message: ERROR400});
      return;
    }
    const result = await face.verify(req, dresult[0].faceId);
    if (result === null) {
      res.status(404).send({message: ERROR404});
    } else {
      res.send(result);
    }
  } catch(err) {
    console.log(err);
    res.status(500).send({message: ERROR500});
  }
});

// register face
router.post('/faces', async function(req, res, next) {
  console.log(req.body);
  const result = await face.registerFace(req);
  console.log(result);
  res.send(result);
});

module.exports = router;
