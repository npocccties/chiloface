const express = require('express');
const router = express.Router();

/* face detection */
router.post('/detect', function(req, res, next) {
  console.log(req.body);
  res.send();
});

/* upload test */
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/upload', upload.single('image'), function(req, res, next) {
//  console.log('print req.file:');
//  console.log(req.file);
//  console.log('print req.body:');
//  console.log(req.body);

  let params;

  if (req.get('content-type') === 'application/json') {
    params = req.body;
    params.image = Buffer.from(params.image, 'base64');
  } else if (req.file) {
    params = JSON.parse(req.body.params);
    params.image = req.file.buffer;
  } else {
    const err = new Error('invalid request');
    err.statusCode = 400;
    next(err);
  }
  console.log(params);
  res.send();
});

module.exports = router;
