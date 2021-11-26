# 内部設計書

以下の仕様について説明します。

- 自動監視の動作仕様
- MongoDBに保存するドキュメント
- 顔画像サーバが提供する API
- 顔画像サーバで使用するドライバインターフェース
- ブラウザで使用する server/public/facelib.js ライブラリ

## 自動監視の動作仕様

自動監視の動作仕様は、次のとおりです。

- 顔画像が登録されるか最初の照合が成功したあと、自動監視が開始する
- デフォルトでは、180秒間隔で3回、カメラから自動的に画像を取得して照合する
- 照合結果(最初の照合も含む)をデータベースに記録する
- 顔検出に失敗した場合も、画像をデータベースに記録する
- その他のエラーは記録されない

## MongoDBに保存するドキュメント

MongoDB のデータベースに、次の collection を作成します。

| 名前 | 内容 |
| ---- | ---- |
| users | ユーザ |
| faces | 顔画像 |
| results | 顔認証結果 |
| setings | 設定 |

以下は、各 collection のドキュメント仕様です。

| users | 内容 |
| ----- | ---- |
| _id | ID |
| createdAt | 作成日時 |
| name | ユーザ名 |
| password | パスワードの bcrypt hash |
| platformId | BASIC認証では 'local' |

| faces | 内容 |
| ----- | ---- |
| _id | ID |
| createdAt | 作成日時 |
| user_id | user ID |
| data | イメージデータ |
| faceId | azure faceId |
| faceIdAt | azure faceId の作成日時 |

| results | 内容 |
| ------- | ---- |
| _id | ID |
| user_id | user ID |
| face_id | face ID |
| data | イメージデータ |
| result | {isIdentical: true/falce, confidence: 信頼度} または null |
| error | エラーメッセージ または null | 

settings collection の唯一のドキュメントに、カスタマイズした設定が保存、参照されます。

## 顔画像サーバが提供する API

顔画像サーバが提供する API は以下のとおりです。

| API | 入力パラメータ | 出力パラメータ | 内容 |
| --- | -------------- | ---- | ---- |
| POST /api/v1/detect | image | result | 顔検出の実行 |
| POST /api/v1/verify | image | result | 顔認証の実行 |
| POST /avpi/v1/faces | image | result | 顔画像の登録 |
| GET /api/vi/user | -- | user | ユーザ情報の取得 |
| GET /api/vi/settings | -- | settings | 設定情報の取得 |

入出力パラメータの仕様は、以下のとおりです。

| image | 内容 |
| ----- | ---- |
| type | 'image/png' または 'image/jpeg' |
| width | イメージの幅(ピクセル) |
| height | イメージの高さ(ピクセル) |
| image | イメージデータ |

| result | 内容 |
| ------ | ---- |
| faceRectangle | 検出結果の配列 |
| isIdentical | 本人と同じかどうか(verifyのみ) |
| confidence | 信頼度(verifyのみ) |

| user | 内容 |
| ---- | ---- |
| registered | 顔画像を登録済み |
| allow_registration | 顔画像を登録可能 |

HTTP ステータスコードの意味は次のとおりです。

| ステータスコード | 意味 |
| ---------------- | ---- |
| 200 | 成功 |
| 201 | 成功、検出した顔を登録した |
| 400 | 顔を検出できなかった |
| 404 | 登録画像が存在しない |
| 500 | エラー |

## 顔画像サーバで使用するドライバインターフェース

顔画像サーバは、MongoDB を使用する場合と、使用しない場合で、ドライバを切り替えて動作します。ドライバのファイル名は次のとおりです。

| ファイル名 | 内容 |
| ---------- | ---- |
| server/lib/facemongo.js | MongDBを使用する |
| server/lib/facemem.js | MongDBを使用しないでメモリのみで動作する |

ドライバのインターフェースは次のとおりです。

- findUser(name)

指定された名前のユーザーを探す

- detect(image)

image から顔画像を検出した結果を返す

- verify(user, image, face)

image,face を user の登録画像と照合した結果を返す

- registerFace(user, image, face)

image, face を user の登録画像として保存する

- getUserInfo(user)

GET /api/v1/user で取得する user に関する情報を返す

- getSettings(user)

GET /api/v1/settings で取得する設定情報を返す


## ブラウザで使用する server/public/facelib.js ライブラリ

ブラウザで使用する facelib.js ライブラリは、以下の機能を持ちます。

- init()

ライブラリの初期化、open した stream を返す

- capture()

画像を取得、ImageBitmap を返す

- drawImage(src, canvas, grayscale = false)

画像(blob または ImageBitmap)を canvas に描画、grayscale 化可能

- compress(blob, option)

以下の option設定に従って ImageBitmap を圧縮し{blob, params}を返す

```
{
  canvas: ccanvas                // 圧縮用canvas
  type: 'image/jpeg'             // 圧縮タイプ
  width: 320                     // イメージの横幅
  height: 240                    // イメージの高さ
  quality: 0.5                   // 圧縮時のクオリティ
  grayscale: false               // カラー
};
```

- postWithImage(url, params, image)

url に params, image を POST する
