# AWSやる

---
---
---

WIP

---
---
---

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
      - ON: AmazonEC2FullAccess
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

## [DEPRECATED] EC2 でアプリ公開する

### Express でアプリを作る

何でも良いけど簡単な Hello World 作ります。まだ AWS 関係なし。

1. パッケージの用意

```console
npm install express @types/express
```

2. サーバースクリプト作成
   - ファイル名は `x-server.js` とします

```js
const express = require("express");

const port = 3000;
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => process.stdout.write(`Listening at ${port}\n`));
```

3. 実行
   - したら URL 開く
   - http://localhost:3000/

```console
$ node x-server.js 
Listening at 3000
```

### EC2 でマシンを用意

途中でダウンロードする `*.pem` は接続に使うのでちゃんと保存しておいてください。

あと Free tier というけれど、たぶん 12 か月限定でその後は有料になる気がする。

- [Tutorial: Getting started with Amazon EC2 Linux instances - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html)
- [Tutorial: Setting Up Node.js on an Amazon EC2 Instance - AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html)

1. AWS EC2 コンソールを開く
   - https://console.aws.amazon.com/ec2/
2. [EC2 Dashboard](https://console.aws.amazon.com/ec2/) > Launch instance
3. "Amazon Linux 2 AMI (HVM), SSD Volume Type" を選択
   - 左側 "Free tier only" にチェックを入れておくと安心
   - CPU は "64-bit (x86)" のままで良い
4. Type が "t2.micro" のものを選択
   - 安心の "Free tier eligible" ラベルが付いているのを確認
   - リージョンによっては "t3.micro" の場合もあるらしい
5. セキュリティグループを確認
   - "Security Groups" のとこ
   - e.g. Security group name : launch-wizard-1
6. Launch ボタンを押す
   - "Select an existing key pair or create new key pair" ダイアログが出てくる
7. キーペア作成
   1. "Create a new key pair"
   2. 適当に名前を入れる。e.g. "my-great-app-keypair"
   3. "Download key pair"
      - "my-great-app-keypair.pem" がダウンロードされる
      - ちゃんと補完しておくこと
      - 人には教えないでね
      - 名前に "keypair" 入れるのなんかあほらしかったわ
8. 完了を確認
   1. Instances > Instances
   2. Instance State が pending から running になるまで待つ

### EC2 インスタンスへ接続

- [Connecting to your Linux instance using SSH - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html)

さっきダウンロードした `my-great-app-keypair.pem` を使います。

1. AWS EC2 インスタンス一覧を開く
   - https://console.aws.amazon.com/ec2/
   - Instances > Instances
2. `my-great-app-keypair.pem` ファイルの存在を確認
   - `ls -l path/to/my-great-app-keypair.pem`
3. 接続方法を確認
   1. 一覧で、さっき作成したインスタンスを選択
   2. 上部 "Connect" ボタン
   3. 接続方法が表示されるのでそれに従う
      - `.pem` ファイルのパーミッションを `400` とかにしとかないと接続失敗する
4. 接続

```console
$ ssh -i ~/.ssh/my-great-app-kaypair.pem ec2-user@ec2-00-00-00-00.us.compute.amazonaws.com
```

### インスタンスを落とす

落とさないとお金がかかります。

あと生成時はインスタンスだけでなく必要なものもまとめてウィザードが生成してくれるんだけど、削除はばらばら手動で頑張る必要があります。頑張れ。

実際は落とした後に作り直すか、まだ落とさないでください。

- [Tutorial: Getting started with Amazon EC2 Linux instances - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html)


1. インスタンスを削除
   1. AWS EC2 インスタンス一覧を開く
      - https://console.aws.amazon.com/ec2/
      - Instances > Instances
   2. 削除
      1. 一覧でインスタンスを選択
      2. Actions > Instance State > Terminate
2. セキュリティグループを削除
   1. AWS EC2 インスタンス一覧を開く
      - https://console.aws.amazon.com/ec2/
      - Network & Security > Security Groups
   2. 削除
      1. 一覧でセキュリティグループを選択
      2. Actions > Delete security group
         - ネットワークから利用されてるから削除できない、とか言われる場合は待つ
         - インスタンスと一緒に消える
         - Network & Security > Network Interfaces で確認できる
3. VPC を削除？
   - 元々あったっけ？
   - https://console.aws.amazon.com/vpc/
   - VIRTUAL PRIVATE CLOUD > Your VPCs
4. 他？？

### ウェブ用のポートを開ける

Security Group を設定しないと、

1. Security Group を設定する
   1.  Security Groups
     - https://console.aws.amazon.com/ec2/
     - Network & Security > Security Groups
     - セキュリティグループを選択（たぶん Security group name が launch-wizard-1）
   2. 画面下部 > Inbound rules > Edit inbound rules
   3. Add rule から Type = HTTP, HTTPS を追加
      - 既存の SSH を上書きしないこと
   4. いずれも Source を My IP に
   5. Save rules
3. Linux (iptables) を設定する
   1. AWS EC2 インスタンスへ接続
      - 前述
   2. 

### Node.js を動かす

- [Tutorial: Setting Up Node.js on an Amazon EC2 Instance - AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html)

1. AWS EC2 インスタンスへ接続
   - 前述
2. nvm をインストール

```console
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
$ . ~/.nvm/nvm.sh
$ nvm install --lts
```

3. インストールを確認

```console
$ node --version
```

### 適当なサーバープログラムを動かす

Hello World しましょう。

1. AWS EC2 インスタンスを用意
   - 前述
2. AWS EC2 インスタンスへ接続
   - 前述
3. アプリ用ディレクトリーを用意
5. Express をインストール

```console
$ echo '{"private":true}' > package.json
$ npm install express
```

#### Security Groups の設定をしてないと

```
$ node server.js
events.js:292
      throw er; // Unhandled 'error' event
      ^

Error: listen EACCES: permission denied 0.0.0.0:80
…
```

## Elastic Beanstalk で簡単な Node.js アプリを動かす

1. GitHub にプロジェクトを用意
2. AWS Elastic Beanstalk と Pipeline を用意
3. デプロイ

### デモ用アプリを用意

1. GitHub で新しいリポジトリーを作成
   - https://github.com/new
2. 手元で適当なプログラムを書く
   1. Express をインストール
   2. `main.js` にコードを書く
   3. `npm start` で動くようにする
   4. 実行してみる
      - http://localhost:3000/

```console
npm install express @types/express
```

```js
const express = require("express");

const port = process.env.PORT || 3000;
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => process.stdout.write(`Listening at ${port}\n`));
```

```json
{
  "private": true,
  "scripts": {
    "start": "node main.js"
  },
…
```

```console
$ npm start
Listening at 3000
```

3. GitHub へ置く
  - `git push -u origin master`

### Pipeline + Elastic Beanstalk

WIP
