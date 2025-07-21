import { relative } from "node:path";
import { defineConfig, type RolldownPlugin } from "rolldown";

declare module "rolldown" {
  interface BindingTransformHookExtraArgs {
    lambdaInfo?: Map<string, string[]>;
  }
}

const useLambdaPlugin = (): RolldownPlugin => {
  const lambdaInfo = new Map<string, string[]>();

  return {
    name: "use-lambda",
    transform(code, id) {
      if (!code.includes("use lambda")) {
        return code;
      }

      const parsed = this.parse(code, {
        lang: "ts",
        astType: "ts",
      });

      const firstStatement = parsed.body.shift();
      const isUseLambdaDirective =
        firstStatement != null &&
        firstStatement.type === "ExpressionStatement" &&
        firstStatement.expression.type === "Literal" &&
        firstStatement.expression.value === "use lambda";

      if (!isUseLambdaDirective) {
        return code;
      }

      const exports = parsed.body.filter(
        (statement) => statement.type === "ExportNamedDeclaration"
      );

      const identifiers = exports.flatMap((node) =>
        node.declaration?.type === "VariableDeclaration"
          ? node.declaration.declarations.flatMap((d) =>
              d.id.type === "Identifier" ? d.id.name : []
            )
          : node.declaration?.type === "FunctionDeclaration"
          ? node.declaration.id != null
            ? [node.declaration.id.name]
            : []
          : []
      );
      lambdaInfo.set(relative(`${import.meta.dirname}`, id), identifiers);

      const newCode = identifiers
        .map(
          (identifier) => `export const ${identifier} = async (...input) => {
              try {
                const command = new InvokeCommand({
                  FunctionName: "action-${identifier}",
                  InvocationType: "RequestResponse",
                  Payload: JSON.stringify(input),
                });
                const { Payload: payload } = await lambdaClient.send(command);
                const result = JSON.parse(Buffer.from(payload).toString("utf8"));
                console.log(result)
                const parsed = JSON.parse(result);
                return parsed;
              } catch (error) {
                console.error("Error invoking Lambda function:", error);
                throw error;
              }
            };`
        )
        .join("\n\n");

      const header = [
        `import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";`,
        `const lambdaClient = new LambdaClient({ region: "ap-northeast-1" });`,
      ].join("\n");

      return {
        code: `${header}\n\n${newCode}`,
      };
    },
    generateBundle() {
      if (lambdaInfo == null) {
        return;
      }

      const outputData = Object.fromEntries(lambdaInfo);

      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: JSON.stringify(outputData, null, 2),
      });
    },
  };
};

export default defineConfig({
  input: "src/index.ts",
  output: {
    dir: "dist/server",
    format: "esm",
    sourcemap: true,
  },
  platform: "node",
  plugins: [useLambdaPlugin()],
});
