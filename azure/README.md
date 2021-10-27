azure.js は、Azure FACE API の動作を確認するサンプルプログラムです。以下の手順で初期化します。

```
$ npm install
```

[Azure Face APIのドキュメント](https://azure.microsoft.com/ja-jp/services/cognitive-services/face/)などを参照して、キーとエンドポイントを取得します。取得したキーとエンドポイントを、以下のように環境変数に設定します。

```
$ export AZURE_KEY=4261...
$ export AZURE_ENDPOINT=https://...
```

イメージファイルから顔検出する場合は、次のようにします。

```
$ node azure.js detect image.jpg
========DETECT FACES========
[
  {
    faceId: '82928a12-456d-4eec-bdb8-686f3d526753',
    recognitionModel: 'recognition_01',
    faceRectangle: { width: 135, height: 187, left: 68, top: 4 }
  }
]
```

azure.js には、以下の機能があります。

| 機能 |
| ---- |
| node azure.js detect image-file |
| node azure.js verify faceId1 faceId2 |
| node azure.js persongroup list |
| node azure.js persongroup create personGroupId name |
| node azure.js persongroup delete personGroupId |
| node azure.js person list personGroupId |
| node azure.js person create personGroupId name |
| node azure.js person delete personGroupId personId |
| node azure.js person addface personGroupId personId image-file |
| node azure.js person verify faceId personGroupId personId |
