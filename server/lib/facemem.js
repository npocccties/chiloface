const azure = require('./azure.js');

const user = {};

function checkUser(req, res, next) {
  req.user = user;
  next();
}

async function detect(req) {
  return await azure.DetectFace(req.body.image);
}

async function verify(req) {
  const target = await azure.DetectFace(req.body.image);
  console.log(target);
  return await azure.VerifyFaceToFace(req.user.face.faceId, target[0].faceId);
}

async function registerFace(req) {
  const image = req.body.image;
  const result = await azure.DetectFace(image);
  const faceId = result[0].faceId;
  req.user.face = {
    image,
    faceId,
  };
  return {
    faceId
  }
}

module.exports = {
  checkUser,
  detect,
  verify,
  registerFace,
}