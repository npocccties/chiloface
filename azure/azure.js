const msRest = require("@azure/ms-rest-js");
const Face = require("@azure/cognitiveservices-face");
const fs = require('fs');

const key = process.env.AZURE_KEY;
const endpoint = process.env.AZURE_ENDPOINT;

const credentials = new msRest.ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } });
const client = new Face.FaceClient(credentials, endpoint);

const detectOption = {
  detectionModel: "detection_03",
  recognitionModel: "recognition_01"
};

async function DetectFace(filename) {
  console.log("========DETECT FACES========");
  const image = fs.readFileSync(filename);
  const result = await client.face.detectWithStream(image, detectOption);
  console.log(result);
}

async function VerifyFaceToFace(face1, face2) {
  console.log("========VERIFY FACES========");
  const result = await client.face.verifyFaceToFace(face1, face2);
  console.log(result);
}

async function PersonGroup(cmd, arg1, arg2) {
  console.log("========PERSON GROUP========");
  let result;
  switch(cmd) {
    case 'list':
      result = await client.personGroup.list();
      console.log(result);
      break;
    case 'create':
      result = await client.personGroup.create(arg1, {name: arg2});
      console.log(result);
      break;
    case 'delete':
      result = await client.personGroup.deleteMethod(arg1);
      console.log(result);
      break;
    default:
      console.log('unknown subcommand');
      break;
  }
}

async function Person(cmd, arg1, arg2, arg3) {
  console.log("========PERSON========");
  let result;
  switch(cmd) {
    case 'list':
      result = await client.personGroupPerson.list(arg1);
      console.log(result);
      break;
    case 'create':
      result = await client.personGroupPerson.create(arg1,{name: arg2});
      console.log(result);
      break;
    case 'delete':
      result = await client.personGroupPerson.deleteMethod(arg1, arg2);
      console.log(result);
      break;
    case 'addface':
      const image = fs.readFileSync(arg3);
      result = await client.personGroupPerson.addFaceFromStream(arg1, arg2, image);
      console.log(result);
      break;
    case 'verify':
      result = await client.face.verifyFaceToPerson(arg1, arg3, {personGroupId: arg2});
      console.log(result);
      break;
    default:
      console.log('unknown subcommand');
      break;
  }
}

const cmd = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];
const arg3 = process.argv[5];
const arg4 = process.argv[6];

switch(cmd) {
  case 'detect':
    DetectFace(arg1);
    break;
  case 'verify':
    VerifyFaceToFace(arg1, arg2);
    break;
  case 'persongroup':
    PersonGroup(arg1, arg2, arg3);
    break;
  case 'person':
    Person(arg1, arg2, arg3, arg4);
    break;
  default:
    console.log('do nothing');
    break;
}
