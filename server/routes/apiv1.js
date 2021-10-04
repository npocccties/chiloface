const express = require('express');
const router = express.Router();
const fs = require('fs');
const face = require('../lib/facemem.js');

const OK200 = "OK";
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
    result.message = OK200;
    res.send(result);
  } catch(err) {
    res.status(500).send({message: ERROR500});
  }
});

// verify face
router.post('/verify', async function(req, res, next) {
  console.log(req.body);
  const result = await face.verify(req);
  console.log(result);
  res.send(result);
});

// register face
router.post('/faces', async function(req, res, next) {
  console.log(req.body);
  const result = await face.registerFace(req);
  console.log(result);
  res.send(result);
});

module.exports = router;
