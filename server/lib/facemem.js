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

async function detect(image) {
  return await azure.DetectFace(image);
}

async function verify(user, _, face) {
  if (face === null) {
    return null;
  }
  const faceId1 = user.face?.faceId;
  const faceId2 = face.faceId;
  if (typeof faceId1 === 'undefined') {
    return null;
  }
  return await azure.VerifyFaceToFace(faceId1, faceId2);
}

function registerFace(user, image, face) {
  const {faceId} = face;
  user.face = {
    faceId,
  };
  return true;
}

function getUserInfo(user) {
  return {
    registered: (typeof user.face !== 'undefined'),
    allow_registration: true,
  };
}

function getSettings(_) {
  return {
    count: 3,
    interval: 180,
  };
}

module.exports = {
  findUser,
  detect,
  verify,
  registerFace,
  getUserInfo,
  getSettings,
};
