facedb.js は、MongoDB に直接アクセスして、データベースの内容表示や、ユーザ登録などに使用するツールです。以下の手順で初期化します。

```
$ npm install
```

接続先ホスト及びポート番号、データベース上のユーザ名及びパスワード、データベースの名称を、FACE_DB 環境変数に Connection String URI 形式で指定します。

```
$ export FACE_DB=mongodb://<DBUser>:<DBUserPassword>@localhost/<DBName>
```

<<参考> https://docs.mongodb.com/upcoming/reference/connection-string/

## 機能一覧

facedb.js には、以下の機能があります。

| 機能 | 説明 |
| ---- | ---- |
| ユーザ |
| node facedb.js user add \<username> \<password> | 追加 |
| node facedb.js user update \<username> \<password> | パスワードの変更 |
| node facedb.js user show [\<username>] | 表示 |
| node facedb.js user list [\<username>] | CSV出力 |
| node facedb.js user delete \<username> | 削除 |
| 登録画像 |
| node facedb.js face show [\<username>] | 表示 |
| node facedb.js face list [\<username>] | CSV出力 |
| node facedb.js face show1 \<username> | 表示(最新登録画像のみ) |
| node facedb.js face delete _id\|\<username> | 削除 |
| 認証結果 |
| node facedb.js result show [\<username>] | 表示 |
| node facedb.js result list [\<username>] | CSV出力 |
| node facedb.js result delete "all"\|_id\|\<username> | 削除 |
| 設定 |
| node facedb.js settings show | 表示 |
| node facedb.js settings add key value | 追加 |
| node facedb.js settings delete key | 削除 |
| インデックス |
| node facedb.js index show | 表示 |
| node facedb.js index add key | 追加 |
| node facedb.js index unique key | ユニークキーの追加 |
| node facedb.js index delete \<index-name> | 削除 |

## 登録済み画像の確認

登録済み画像を確認する場合は、face に対して show または list を指定します。show を指定すると、data に画像のサイズ(バイト数)が表示れます。list を指定すると、CSV形式、時刻は JST、ユーザ名が表示されます。facedb.js には画像をイメージとして表示する機能はありません。

```
$ node facedb.js face show
{
  _id: new ObjectId("6172d1a9fee5263badd2aec0"),
  createdAt: 2021-10-22T14:58:49.402Z,
  user_id: new ObjectId("616433f236d68c07b39e8a91"),
  data: 8496,
  faceId: '245318e8-313a-4a3f-9613-d78b9111d15a',
  faceIdAt: 2021-10-26T09:18:50.610Z
}
$ node facedb.js face list
_id,createdAt,user_id,name
6172d1a9fee5263badd2aec0,2021/10/22 23:58:49,616433f236d68c07b39e8a91,user
```

## 認証結果の確認

認証結果を表示する場合は、result に対して show または list を指定します。認証に失敗した場合も、キャプチャーした画像とエラーがデータベースに記録されます。

```
$ node facedb.js result show
...
{
  _id: new ObjectId("61763264d89d88964e323040"),
  createdAt: 2021-10-25T04:28:20.100Z,
  user_id: new ObjectId("616433f236d68c07b39e8a91"),
  face_id: new ObjectId("6172d1a9fee5263badd2aec0"),
  data: 9063,
  result: null,
  error: "can't detect face"
}
{
  _id: new ObjectId("6177c7faf182c8aab91fa63a"),
  createdAt: 2021-10-26T09:18:50.841Z,
  user_id: new ObjectId("616433f236d68c07b39e8a91"),
  face_id: new ObjectId("6172d1a9fee5263badd2aec0"),
  data: 8636,
  result: { isIdentical: true, confidence: 0.89008 },
  error: ''
}

$ node facedb.js result list
_id,createdAt,user_id,face_id,isIdentical,confidence,error,name
...
617631afd89d88964e32303f,2021/10/25 13:25:19,616433f236d68c07b39e8a91,6172d1a9fee5263badd2aec0,false,0,can't detect face,fujii
61763264d89d88964e323040,2021/10/25 13:28:20,616433f236d68c07b39e8a91,6172d1a9fee5263badd2aec0,false,0,can't detect face,fujii
6177c7faf182c8aab91fa63a,2021/10/26 18:18:50,616433f236d68c07b39e8a91,6172d1a9fee5263badd2aec0,true,0.89008,,fujii
6177c8aff182c8aab91fa63b,2021/10/26 18:21:51,616433f236d68c07b39e8a91,6172d1a9fee5263badd2aec0,true,0.8544,,fujii
```

## GUI動作のカスタマイズ

GUI動作のパラメータをカスタマイズしたい場合は、settings を変更します。カスタマイズできるパラメータは次のとおりです。

| 項目 | 内容 |
| ---- | ---- |
| count | 自動監視回数 |
| interval | 自動監視間隔(秒) |
| type | 圧縮形式 (デフォルト image/jpeg) |
| width | 画像の幅 (ピクセル) |
| height | 画像の高さ (ピクセル) |
| quality | 圧縮率 (0以上 1以下の数) |

自動監視回数をカスタマイズしたい場合は、settings に対して add します。現在の状態は show で表示され、カスタマイズを取り消してデフォルト動作にするときは delete します。

```
$ node facedb.js settings add count 2
{
  acknowledged: true,
  modifiedCount: 1,
  upsertedId: null,
  upsertedCount: 0,
  matchedCount: 1
}
$ node facedb.js settings show
{ _id: new ObjectId("61713a9d076e7b75cc6bf259"), count: '2' }
$ node facedb.js settings delete count
{
  acknowledged: true,
  modifiedCount: 1,
  upsertedId: null,
  upsertedCount: 0,
  matchedCount: 1
}
```

## インデックスの設定

データベースの性能を維持するために collection にインデックスを設定します。本システムでは、以下の設定を行うことを推奨します。運用開始後の早い段階で、以下のコマンドを実行してください。

```
$ node facedb.js index unique users name
$ node facedb.js index add faces user_id
$ node facedb.js index add results user_id
```
