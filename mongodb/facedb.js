const {MongoClient} = require('mongodb');
const bcrypt = require('bcrypt');

const url = process.env.FACE_DB;
let client;
let db;
let users;
let results;

async function start(){
  try {
    client = new MongoClient(url);
    await client.connect();
    db = client.db();
    users = db.collection('users');
    results = db.collection('results');
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

const cmd = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];
const arg3 = process.argv[5];
const arg4 = process.argv[6];

switch(cmd) {
  case 'user':
    DoUser(arg1, arg2, arg3, arg4);
    break;
  case 'result':
    break;
  default:
    console.log('do nothing');
    break;
}