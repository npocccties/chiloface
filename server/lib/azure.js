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

async function DetectFace(image) {
  console.log("========DETECT FACES========");
  return await client.face.detectWithStream(image, detectOption);
}

async function VerifyFaceToFace(face1, face2) {
  console.log("========VERIFY FACES========");
  return await client.face.verifyFaceToFace(face1, face2);
}

module.exports = {
  DetectFace,
  VerifyFaceToFace,
}
