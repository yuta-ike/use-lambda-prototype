# use-lambda-prototype

lambda のようなインフラ情報をコードに埋め込むフレームワークのプロトタイプです。

`"use lambda"` をファイルの先頭に書くと、そのファイルで export されている関数は、Lambda 関数として実行されます。

以下の例の場合、たし算の処理が Lambda 関数として実行されます。

```ts
// src/action.ts （Lambda関数で実行される）
"use lambda";
export const calcAddition = (a: number, b: number): number => {
  return a + b;
};

// src/route.ts （コンテナアプリケーションで実行される）
import { calcAddition } from "./action";

app.post("/add", (req, res) => {
  const { a, b } = req.body;
  const result = calcAddition(a, b);
  res.json({ result });
});
```

## 実行

```bash
pnpm install

# ビルドして Lambda 関数をデプロイ
pnpm build:app && pnpm build:lambda && ./scripts/deploy-lambda.sh

# localstack を起動
docker compose up -d

# ローカルで Node.js アプリケーションを起動
pnpm start

# リクエストを送信
curl -X POST http://localhost:3000/add -H "Content-Type: application/json" -d '{"a": 1, "b": 2}'
```

## 仕組み

Rolldown plugin として実現されています。

ビルドは、Node.js アプリのビルド、Lambda 関数のビルドの 2 フェーズに分かれています。Node.js アプリのビルドでは、`"use lambda"` を検出して、Lambda 関数として実行される関数を抽出します。抽出された関数は、Lambda 関数を Invoke する実装に差し替えられます。

Lambda 関数のビルドでは、抽出された関数が Lambda 関数として実行されるように、必要なエントリポイントなどのコードが追加されます。

## 制約

- 入力として JSON.stringify できない値を受け取ることはできません。
- 出力として JSON.stringify できない値を返すことはできません。
- 同名の Lambda 関数が複数存在する場合に対応していません。
- インライン形式の "use lambda" はサポートしていません。
- Lambda 関数は同期的に呼び出されます。
