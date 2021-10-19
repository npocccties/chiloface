const azure = require('./azure.js');
const {MongoClient} = require('mongodb');

const valid_duration = 3 * 3600 * 1000;    // 3 hours
// const valid_duration = 30 * 1000;    // 30 seconds for test

const url = process.env.FACE_DB;
let client;
let db;
let users;
let faces;
let results;

async function start(){
  try {
    client = new MongoClient(url);
    await client.connect();
    db = client.db();
    users = db.collection('users');
    faces = db.collection('faces');
    results = db.collection('results');
    console.log("facemongo: started");
  } catch(err){
    console.log("facemongo: error in start");
    console.log(err);
  }
}

async function findUser(name) {
  return await users.findOne({name});
}

async function detect(image) {
  const now = new Date();
  const res = await azure.DetectFace(image);
  if (res.length > 0) {
    res[0].createdAt = now;
  }
  return res;
}

async function findFace(user) {
  return await faces.findOne({user_id: user._id},{sort: {createdAt: -1}});
}

async function getAzureFaceId(face) {
  const now = new Date();
  if ((now.getTime() - face.faceIdAt.getTime()) > valid_duration) {
    console.log("getAzureFaceId: update faceId");
    const res = await detect(face.data.read(0, face.data.length()));
    if (res.length > 0) {
      const {faceId, createdAt} = res[0];
      const ures = await faces.updateOne({
        _id: face._id,
      },{
        $set: {
          faceId,
          faceIdAt: createdAt,
        }
      });
      if (!ures.acknowledged) {
        console.log("getAzureFaceId: update error");
      }
      return faceId;
    }
    console.log("getAzureFaceId: detect error");
    return null;
  }

  console.log("getAzureFaceId: reuse faceId");
  return face.faceId;
}

async function verify(user, image, aface) {
  const face = await findFace(user);
  let res = null;
  let error = '';

  if (aface !== null) {
    if (face !== null) {
      const faceId1 = await getAzureFaceId(face);
      if (faceId1 !== null) {
        const faceId2 = aface.faceId;
        res = await azure.VerifyFaceToFace(faceId1, faceId2);
      } else {
        error = 'can\'t get azure FaceId from registered face';
      }
    } else {
      error = 'face not registered';
    }
  } else {
    error = 'can\'t detect face';
  }

  const ires = await results.insertOne({
    createdAt: new Date(),
    user_id: user._id,
    face_id: face?._id,
    data: image,
    result: res,
    error,
  });
  console.log(ires);
  return res;
}

async function registerFace(user, image, aface) {
  const {faceId, createdAt} = aface;
  const res = await faces.insertOne({
    createdAt: new Date(),
    user_id: user._id,
    data: image,
    faceId,
    faceIdAt: createdAt,
  });
  console.log(res);
  return res.acknowledged;
}

async function getUserInfo(user) {
  const face = await findFace(user);
  const count = await results.count({user_id: user._id});

  return {
    registered: (face !== null),
    allow_registration: (count === 0),
  };
}

module.exports = {
  start,
  findUser,
  detect,
  verify,
  registerFace,
  getUserInfo,
};
