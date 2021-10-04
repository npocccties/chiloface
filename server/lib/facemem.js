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
  const result = await azure.DetectFace(req.body.image);
  const faceRectangle = result.map(e => e.faceRectangle);
  return {
    faceRectangle,
  }
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