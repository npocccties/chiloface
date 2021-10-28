# FaceRecognition-private

## ファイル

本レポジトリには、以下のファイルが含まれます。

| ファイル名 | 内容 |
| ---------- | ---- |
| azure/azure.js | Azure FACE API を使うユーティリティ |
| mongodb/facedb.js | MongoDB に直接アクセスするユーティリティ |
| server | webサーバ、webブラウザ用のHTMLページ |
| server/bin/www | 受信ポートを設定してサーバを起動動作 |
| server/app.js | express のグローバル設定 |
| server/routes/apiv1.js | web API /api/v1 の処理 |
| server/lib/facemem.js | メモリで動作するドライバ |
| server/lib/facemongo.js | MongoDB を使って動作するドライバ |
| server/lib/azure.js | Azure FACE API を呼び出すコード |
| server/public/index.html | トップページ |
| server/public/test.html | テストページ |
| server/public/facelib.js | ブラウザ用ライブラリ |

## 事前準備

顔画像サーバを使用するためには、事前に以下の作業が必要です。

1. Azure FACE API 用のキーおよびエンドポイントを取得する
2. MongoDB を用意する
3. 顔画像サーバが使用する DBの作成
4. 顔画像サーバを使うユーザーの登録

Azure FACE API 用のキーおよびエンドポイントを取得については、azure/README.md を参照してください。

MongoDB を Linux などで動作させる場合は、以下の Web ページなどを参考に、インストール、起動、セキュリティ初期設定などを行います。

```
Install MongoDB Community Edition on Ubuntu
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

Use SCRAM to Authenticate Clients
https://docs.mongodb.com/manual/tutorial/configure-scram-client-authentication/
```

MongoDB を docker で動作させる場合は、[このページ](https://hub.docker.com/_/mongo)の情報が参考になります。docker compose を使って、以下のように動作させることができます。

```
$ cat mongo.yml
services:
  mongo:
      image: mongo:4.4
      restart: always
      ports:
        - 27017:27017
      environment:
        MONGO_INITDB_ROOT_USERNAME: <rootUser>
        MONGO_INITDB_ROOT_PASSWORD: <rootUserPassword>
$ docker-compose -f mongo.yml up -d
```

次に、管理者権限で mongod に接続し、顔画像サーバが使うDB、そのDBを管理するユーザを作成して、パスワードを設定します。

```
$ mongo mongodb://<rootUser>:<rootUserPassword>@localhost/
> use <DBName>
> db.createUser({
  user: "<DBUser>",
  pwd: passwordPrompt(),
  roles: [ "readWrite" ],
})
Enter password: <DBUserPassword>
```

顔画像サーバを使うユーザーは、mongodb/facedb.js を使って登録します。FACE_DB 環境変数に DB管理ユーザ、パスワード、DB名を指定して、DB管理ユーザの権限で MongoDB にアクセスします。登録したユーザのパスワードは、ハッシュ化されて DBに保存されます。

```
$ cd mongodb
$ npm install
$ export FACE_DB=mongodb://<DBUser>:<DBUserPassword>@localhost/<DBName>
$ node facedb.js user add user password
$ node facedb.js user show
{
  _id: new ObjectId("6177c5f4df94ef211ba9700f"),
  createdAt: 2021-10-26T09:10:12.080Z,
  name: 'user',
  password: '$2b$10$OJYdD/PSGcodaDcKKXRgD.r.v4OPyTXCzUI99vkli9lK5/hTs5NEy',
  platformId: 'local'
}
$ node facedb.js user list
_id,createdAt,name,password,platformId
6177c5f4df94ef211ba9700f,2021/10/26 18:10:12,user,$2b$10$OJYdD/PSGcodaDcKKXRgD.r.v4OPyTXCzUI99vkli9lK5/hTs5NEy,local
$ node facedb.js user update user newpassword
$ node facedb.js user delete user
{ acknowledged: true, deletedCount: 1 }
```

## サーバの起動

顔画像サーバの起動方法については、server/README.md を参照してください。

## webページ

http://localhost:3000 にアクセスするとトップページが表示されます。トップページでは、Web カメラで撮影した画像を、表示、顔検出、登録、照合することができます。テキストエリアに表示されたメッセージに従って操作すると、登録または初回照合のあと、自動監視モードに移行します。

http://localhost:3000/test.html にアクセスすると、画像サイズや圧縮率を自由に調整して照合結果を確認することができるテストページが表示されます。

## 設定変更、登録状況、照合結果の確認

mongodb/facedb.js を使って次のことができます。詳しくは、mongodb/README.md を参照してください。
- 顔画像の登録状況の確認
- 顔画像の照合結果の確認
- GUI動作のカスタマイズ
- インデックスの設定