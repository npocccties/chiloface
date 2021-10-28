server ディレクトリには、顔画像サーバのソースコードと、Webブラウザ用の HTMLファイルおよび JavaScript ファイルが含まれます。顔画像サーバを動作させる場合は、以下の手順で初期化します。

```
$ npm install
```

## 環境変数の設定

サーバを起動する前に環境変数を設定します。AZURE_KEY, AZURE_ENDPOINT の設定は必須です。
AZURE_KEY, AZURE_ENDPOINT の詳細については、azure/README.md を参照してください。
FACE_DB の詳細については、mongodb/README.md を参照してください。

```
$ export AZURE_KEY=4261...
$ export AZURE_ENDPOINT=https://...
$ export FACE_DB=mongodb://<DBUser>:<DBUserPassword>@localhost/<DBName>
```

https を使うときは cert 及び key ファイルのパスと、ポート番号を指定します。

```
$ export HTTPS_CERT_PATH=<cert-path>
$ export HTTPS_KEY_PATH=<key-path>
$ export PORT=443
```

デフォルトでは、顔画像サーバは http://localhost:3000 でリクエストを受け付けます。

## サーバの起動

サーバは、次の方法で起動します。

```
$ node bin/www
GET /test.html 304 5.285 ms - -
GET /stylesheets/style.css 304 0.762 ms - -
GET /facelib.js 304 0.497 ms - -
GET /api/v1/user 200 3.328 ms - 46
GET /api/v1/settings 200 1.027 ms - 26
...
```

デバッグオプションを指定すると、さまざまなメッセージが表示されます。

```
$ DEBUG=server:server,mongo node bin/www
  server:server Listening on port 3000 +0ms
  mongo facemongo: started +28ms
GET / 304 65.529 ms - -
GET /stylesheets/style.css 304 60.727 ms - -
GET /facelib.js 304 59.655 ms - -
GET /api/v1/settings 200 64.330 ms - 2
GET /api/v1/user 200 65.208 ms - 46
POST /api/v1/detect 200 902.192 ms - 66
  mongo getAzureFaceId: update faceId +38s
POST /api/v1/verify 200 465.523 ms - 106
...
```

## MongoDB を使わない方法

FACE_DB 環境変数を指定しないで顔画像サーバを起動すると、MongoDB を使用しないで、次のように動作します。

- 任意のユーザ名を受け付け、パスワードは無視する
- ユーザ名が異なるユーザは、それぞれ別々のユーザとして認識する
- 検出、登録、照合が可能
- 登録画像は、登録から24時間だけ有効(24時間経過後は照合に失敗する)
- いつでも新しい画像を登録できる
- 顔画像サーバを停止すると、すべての記録が失われる
- 動作中も顔画像イメージはメモリーに保持しない
- 顔画像の特徴量は Azure FACE API に保持され、顔画像サーバは照合するときに使用する faceId のみ保持する
