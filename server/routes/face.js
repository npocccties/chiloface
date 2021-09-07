const express = require('express');
const router = express.Router();

/* face detection */
router.post('/detect', function(req, res, next) {
  console.log('detect called');
  console.log(req.body);
  res.send({message: 'detect called'});
});

/* for multipart test */
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/multi', upload.single('image'), function(req, res, next) {
  console.log('multi called');
  console.log('print req.file:');
  console.log(req.file);
  console.log('print req.files:');
  console.log(req.files);
  console.log('print req.body:');
  console.log(req.body);
  res.send();
});

module.exports = router;
