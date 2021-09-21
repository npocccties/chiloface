const azure = require('./azure.js');

function checkUser(req, res, next) {
  next();
}

async function detect(req) {
  return await azure.DetectFace(req.body.image);
}

module.exports = {
  checkUser,
  detect,
}