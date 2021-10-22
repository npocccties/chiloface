const {MongoClient, ObjectId} = require('mongodb');
const bcrypt = require('bcrypt');

const url = process.env.FACE_DB;
let client;
let db;
let users;
let faces;
let results;
let settings;

async function start(){
  try {
    client = new MongoClient(url);
    await client.connect();
    db = client.db();
    users = db.collection('users');
    faces = db.collection('faces');
    results = db.collection('results');
    settings = db.collection('settings');
  } catch(err){
    console.log("error in start");
    console.log(err);
  }
}

async function stop(){
  try {
    client.close();
  } catch(err){
    console.log("error in stop");
    console.log(err);
  }
}

function convertPassword(plain) {
  return bcrypt.hash(plain, 10);
}

async function DoUser(arg1, arg2, arg3, arg4) {
  let res;
  await start();

  switch(arg1) {
  case 'add':
    await users.insertOne({
      createdAt: new Date(),
      name: arg2,
      password: await convertPassword(arg3),
      platformId: "local"
    });
    break;
  case 'update':
    await users.updateOne({
      name: arg2,
    },{
      $set: {
        password: await convertPassword(arg3)
      }
    });
    break;
  case 'show':
    if (arg2) {
      res = await users.findOne({name: arg2});
      console.log(res);
    } else {
      res = await users.find().toArray();
      res.forEach(user => {
        console.log(user);
      });
    }
    break;
  case 'delete':
    res = await users.deleteOne({name: arg2});
    console.log(res);
    break;
  }

  await stop();
}

async function DoFace(arg1, arg2, arg3, arg4) {
  let res;
  await start();

  switch(arg1) {
  case 'show':
    if (arg2) {
      const user = await users.findOne({name: arg2});
      res = await faces.find({user_id: user._id}).toArray();
    } else {
      res = await faces.find().sort({createdAt: 1}).toArray();
    }
    res.forEach(face => {
      face.data = face.data.length();
      console.log(face);
    });
    break;
  case 'show1':
    const user = await users.findOne({name: arg2});
    res = await faces.findOne({user_id: user._id},{sort: {createdAt: -1}});
    if (res !== null) {
      res.data = res.data.length();
      console.log(res);
    }
    break;
  case 'delete':
    try {
      res = await faces.deleteOne({_id: new ObjectId(arg2)});
    } catch(err) {
      const user = await users.findOne({name: arg2});
      res = await faces.deleteMany({user_id: user._id});
    }
    console.log(res);
    break;
  }

  await stop();
}

async function DoResult(arg1, arg2, arg3, arg4) {
  let res;
  await start();

  switch(arg1) {
  case 'show':
    if (arg2) {
      const user = await users.findOne({name: arg2});
      res = await results.find({user_id: user._id}).toArray();
    } else {
      res = await results.find().sort({createdAt: 1}).toArray();
    }
    res.forEach(result => {
      result.data = result.data.length();
      console.log(result);
    });
    break;
  case 'delete':
    if (arg2 === 'all') {
      res = await results.deleteMany();
    } else {
      try {
        res = await results.deleteOne({_id: new ObjectId(arg2)});
      } catch(err) {
        const user = await users.findOne({name: arg2});
        res = await results.deleteMany({user_id: user._id});
      }
    }
    console.log(res);
    break;
  }

  await stop();
}

async function DoSettings(arg1, arg2, arg3, arg4) {
  let res;
  let kv;
  await start();

  switch(arg1) {
  case 'show':
    res = await settings.findOne();
    console.log(res);
    break;
  case 'add':
    kv = {};
    kv[arg2] = arg3;
    res = await settings.updateOne({},{$set: kv},{upsert: true});
    console.log(res);
    break;
  case 'delete':
    kv = {};
    kv[arg2] = "";
    res = await settings.updateOne({},{$unset: kv});
    console.log(res);
    break;
  }

  await stop();
}

async function showIndexInfo(collection) {
  const res = await db.indexInformation(collection);
  console.log(collection, res);
}

async function DoIndex(arg1, arg2, arg3, arg4) {
  let res;
  let kv;
  await start();

  switch(arg1) {
  case 'show':
    await showIndexInfo('users');
    await showIndexInfo('faces');
    await showIndexInfo('results');
    await showIndexInfo('settings');
    break;
  case 'add':
    res = await db.collection(arg2).createIndex(arg3);
    console.log(res);
    break;
  case 'delete':
    res = await db.collection(arg2).dropIndex(arg3);
    console.log(res);
    break;
  }

  await stop();
}

const cmd = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];
const arg3 = process.argv[5];
const arg4 = process.argv[6];

switch(cmd) {
  case 'user':
    DoUser(arg1, arg2, arg3, arg4);
    break;
  case 'face':
    DoFace(arg1, arg2, arg3, arg4);
    break;
  case 'result':
    DoResult(arg1, arg2, arg3, arg4);
    break;
  case 'settings':
    DoSettings(arg1, arg2, arg3, arg4);
    break;
  case 'index':
    DoIndex(arg1, arg2, arg3, arg4);
    break;
  default:
    console.log('do nothing');
    break;
}
