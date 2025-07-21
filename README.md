# use-lambda

Node.js + Lambda のハイブリッドアプリケーション

## 概要

このプロジェクトは、Node.js サーバーアプリケーションと AWS Lambda 関数を組み合わせたハイブリッドな構成です。開発時は LocalStack を使用してローカル環境で AWS サービスをエミュレートします。

## 構成

- **Node.js サーバー**: Fastify を使用した Web サーバー（ポート 3000）
- **Lambda 関数**: "use lambda" ディレクティブで指定された関数を自動的に Lambda としてデプロイ
- **LocalStack**: AWS サービスのローカルエミュレーション

## 使用方法

### 開発環境の起動

```bash
# Docker Compose でサービスを起動
pnpm run docker:up

# ログを確認
pnpm run docker:logs

# サービスを停止
pnpm run docker:down
```

### 手動ビルド

```bash
# サーバー用ビルド
pnpm run build:app

# Lambda 用ビルド
pnpm run build:lambda
```

### Lambda 関数の手動デプロイ

```bash
# Lambda関数を手動でデプロイ（LocalStackが起動している状態で）
pnpm run lambda:deploy
```

## アクセス先

- **Web サーバー**: http://localhost:3000
- **LocalStack**: http://localhost:4566
- **LocalStack UI**: http://localhost:4566/\_localstack/cockpit

## ディレクトリ構造

```
├── dist/
│   ├── server/       # Node.js サーバーのビルド結果
│   └── lambda/       # Lambda 関数のビルド結果
├── src/
│   ├── index.ts      # メインのサーバーアプリケーション
│   └── actions.ts    # アクション定義
├── scripts/
│   └── deploy-lambda.sh  # Lambda デプロイスクリプト
├── volume/           # LocalStack のデータ永続化
├── Dockerfile        # アプリケーション用 Docker イメージ
└── compose.yml       # Docker Compose 設定
```

## Lambda 関数の作成

`"use lambda"` ディレクティブを使用して Lambda 関数を作成できます：

```typescript
"use lambda";

export function myLambdaFunction(event: any) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Lambda!" }),
  };
}
```

この関数は自動的に LocalStack の Lambda にデプロイされます。

## トラブルシューティング

### LocalStack が起動しない場合

```bash
docker-compose down
docker-compose up -d localstack
```

### Lambda 関数のデプロイに失敗する場合

```bash
# Lambda関数を再デプロイ
pnpm run lambda:deploy
```

### コンテナを完全にリセットしたい場合

```bash
docker-compose down -v
docker system prune -f
pnpm run docker:up
```
