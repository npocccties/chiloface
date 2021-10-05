const basicAuth = require('basic-auth')
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

function checkUser(req, res, next) {
  const credential = basicAuth(req);
  console.log(credential);
  if (typeof credential === 'undefined' || credential.name === '' ){
    res.setHeader('WWW-Authenticate', 'Basic realm="tutorial"');
    next({
      statusCode: 401,
      message: 'authenticaion error'
    });
  }
  req.user = findUser(credential.name);
  next();
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
  checkUser,
  detect,
  verify,
  registerFace,
}