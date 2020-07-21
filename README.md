# AWSやる

## Elastic Beanstalk でアプリ公開

- [Getting started using Elastic Beanstalk - AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/GettingStarted.html)

やること：

1. GitHub にデモアプリ（Hello World）作成
2. Elastic Beanstalk を用意
3. CodePipeline を用意してデプロイ

### 先にまとめ

- Elastic Beanstalk で新規作成時に Node.js を選べば適宜用意してくれる
- GitHub 等との連携は別途 CodePipeline で行う（簡単）
- `npm run start` で実行されるので、スクリプトを用意する
- ウェブサーバーのポートは環境変数 PORT で与えられる
- コードのバージョン管理に S3 を利用している
  - アプリケーション削除の際に削除できるが、念のため確認しといて

### GitHub にデモアプリ（Hello World）作成

何でもいいです。公式のデモでもよろしい。

1. プロジェクト用のディレクトリー作成
2. `package.json` 用意

```json
{
  "private": true,
  "scripts": {
    "start": "node main.js"
  }
}
```

3. Express をインストール

```console
npm install express
```

4. 実装
   - `main.js` を作ります
   - `process.env.PORT` で listen する
   - `PORT` の内容は後に Elastic Beanstalk の環境が用意、指定してくる

```js
const express = require("express");

const port = process.env.PORT || 3000;
const app = express();

app.get("/", (req, res) => {
  res.send(`Hello World from ${port}!`);
});

app.listen(port, () => process.stdout.write(`Listening at ${port}\n`));
```

6. 動作確認
7. GitHub で公開

### Elastic Beanstalk を用意

これが本丸だけどこの後 CodePipeline までやらないと動きません。

1. コンソールを開く
   1. https://console.aws.amazon.com/elasticbeanstalk/
2. "Create Application"
3. 埋める
   1. 適当に名前を入力 e.g. try-aws-beanstalk
   2. tags は空のままでよろしい
   3. Platform は Node.js を選択
      1. Platform branch, Platform version は初期値のまま
   4. Application code は "Sample application"
4. "Create application"
5. 出来上がるまで待ってる間に次へ

### CodePipeline を用意してデプロイ

GitHub から自動でコードを引っ張ってきて Elastic Beanstalk へ渡してくれるやつです。

- [Create a pipeline in CodePipeline - AWS CodePipeline](https://docs.aws.amazon.com/codepipeline/latest/userguide/pipelines-create.html)

1. CodePipeline コンソールを開く
   1. http://console.aws.amazon.com/codesuite/codepipeline/
2. "Create pipeline"
3. Pipeline settings
   1. 適当に名前を入力 e.g. try-aws-beanstalk
   2. Service role は New service role のまま
   3. Role name は自動入力されるもののまま
      - 後で削除してやり直した際に "The service role name already exists" と言われ-ら、Service role を Existing service role にする
   4. "Next"
4. Source
   1. Source provider で GitHub を選択
      - するとなんか色々出てくる
   2. "Connect to GitHub"
   3. 対象の Repository と Branch を選択
   4. "Next"
5. Build - optional
   1. "Skip build stage"
6. Deploy
   1. Deploy provider で AWS Elastic Beanstalk を選択
   2. Region は近いものを
   3. Application name はさっき作成した Elastic Beanstalk のもの e.g. try-aws-beanstalk
   4. Environment name も同じく e.g. TryAwsBeanstalk-env
7. Review
   1. ここまでの振り返りをする（しといて）
   2. "Create pipeline"
8. パイプラインが起動するので、しばらく眺める
   1. そのうち Source が Succeeded になる
   2. やがて Deploy が Succeeded になる
9. 確認
   1. Elastic Beanstalk の Environment の方を開く
   2. Health が OK になってれば OK
   4. "TryAws-env.eba-a1b2c3d4.us-west-2.elasticbeanstalk.com" みたいなリンクが上の方にあるので探して開く
   5. やったね！

## アプリ用アカウント作成

あんまりよくわかってないけど、きっと分けておいた方が安全だと思うので分けます。こんな設定で大丈夫なんだろか。

アプリ用の権限を持つグループ `my-great-app` と、そのグループでAPIから権限を行使するアプリ用のユーザー `my-great-app-app` を用意します。別途、管理用にログインできるユーザー `my-great-app-admin` を用意するのも良いのかも。

- [Getting Your Credentials - AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-your-credentials.html)
- [Loading Credentials in Node.js from the Shared Credentials File - AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html)

1. IAM コンソールを開く
   - https://console.aws.amazon.com/iam/
2. グループ作成
   1. Access management > Groups > Create New Group
   2. グループ名入力 e.g. `my-great-app`
   3. 権限を設定（それっぽいのにしたけど、これで良いのかわからない）
      - ON: AmazonDynamoDBFullAccesswithDataPipeline
      - ON: AmazonS3FullAccess
   4. Create Group で完了
3. ユーザー作成
   1. Access management > Users > Add User
   2. ユーザー名入力 e.g. `my-great-app-app`
   3. アクセス種別を設定
      - ON: Programmatic access
      - OFF: AWS Management Console access
   4. さっき作ったグループへ追加
   5. Tags は空のまま（何だかわからないので）
   6. Create user で作成
   7. Access key ID と Secret access key をメモ（次で使う）
      - 人には教えないでね
      - 見逃すともう手に入らない
      - 追加と削除は Access management > Users > ユーザー選択 > Security credentials > Create access key
4. 設定ファイル作成
   1. `~/.aws/credentials` を作成
   2. 中身はこう
      - キー値は先ほど保存した Access key ID と Secret access key
      - 人には教えないでね
      - 下に書いたキー値は[公式文書で提示される例](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-your-credentials.html)より
      - "my-great-app" はプロファイル名、"default" じゃないと人手間かかるけど分けた方が良いと思うので

```
[my-great-app]
aws_access_key_id = AKIAIOSFODNN7EXAMPLE
aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### AWS 関係パッケージをインストール

Node.js 環境とプロジェクトのディレクトリーとかの準備は各自やっといてください。

```console
$ npm install aws-sdk
```

### AWS の設定を Node.js から利用する

1. スクリプトを作成
   - 試しに `x-aws.js`
   - "my-great-app" はさっき作ったファイルでのプロファイル名
   - 今後も `SharedIniFileCredentials` が必要になる
   - 内容はこう

```js
const AWS = require("aws-sdk");

const profile = "my-great-app";

const credentials = new AWS.SharedIniFileCredentials({ profile });
AWS.config.credentials = credentials;
AWS.config.getCredentials((err) => {
  if (err) {
    handleError(err);
    return;
  }

  if (!AWS.config.credentials) {
    handleError(new Error("Credentials are empty"));
    return;
  }

  console.log("accessKeyId:", AWS.config.credentials.accessKeyId);
});

/**
 * @param {unknown} error
 */
function handleError(error) {
  console.error(error);
}
```

2. スクリプト実行
   - `aws_access_key_id` の値が表示されるはず

```console
$ npm x-aws.js
accessKeyId: AKIAIOSFODNN7EXAMPLE
```

### S3 を触ってみる

チュートリアルでは S3 のバケット操作をやってるのでそれを試す。

- [Getting Started in Node.js - AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-nodejs.html)
  - `npm install uuid` を忘れずに

### オブジェクトの確認とバケットの削除

チュートリアルの例を実行するたびに `node-sdk-sample-77c9f63c-dc79-4039-a107-09e9cfe8c590` みたいなバケットが作られ続けるので、遊んだらバケットは削除する。

1. S3 コンソールを開く
   - https://console.aws.amazon.com/s3/
2. 一覧の中から該当バケットをひとつ選択
3. Delete
   - 複数選択していると削除できない
   - 削除確認としてバケット名（ランダム部分を含む）を入力する
   - ちょっと時間がかかる

なんでランダムにしてるんだろ。
