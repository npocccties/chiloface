const basicAuth = require('basic-auth')
const azure = require('./azure.js');

const users = {};

function find_user(name) {
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
  req.user = find_user(credential.name);
  next();
}

async function detect(req) {
  return await azure.DetectFace(req.body.image);
}

async function verify(req, faceId) {
  let faceId1;
  try {
    faceId1 = req.user.face.faceId;
  } catch(err) {
    return null;
  }
  return await azure.VerifyFaceToFace(req.user.face.faceId, faceId);
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