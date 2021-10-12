const azure = require('./azure.js');

const users = {};

function findUser(name) {
  let user = users[name];
  if (typeof user === 'undefined') {
    user = {};
    users[name] = user;
  }
  return user;
}

async function detect(req) {
  return await azure.DetectFace(req.body.image);
}

async function verify(req, faceId) {
  const faceId1 = req.user.face?.faceId;
  if (typeof faceId1 === 'undefined') {
    return null;
  }
  return await azure.VerifyFaceToFace(req.user.face.faceId, faceId);
}

function registerFace(req, faceId) {
  const {image} = req.body;
  req.user.face = {
    image,
    faceId,
  };
}

module.exports = {
  findUser,
  detect,
  verify,
  registerFace,
}