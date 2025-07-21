import { defineConfig, type RolldownOptions } from "rolldown";
import { readFileSync } from "node:fs";
import { dirname, basename, relative } from "node:path";

const buffer = readFileSync("dist/server/manifest.json");
const json = JSON.parse(buffer.toString()) as Record<string, string[]>;
const entries = Object.entries(json).flatMap(([path, actions]) =>
  actions.map((actionName) => `${dirname(path)}/action-${actionName}.ts`)
);
const functionNameToDefinedPath = Object.fromEntries(
  Object.entries(json).flatMap(([path, actions]) =>
    actions.map((actionName) => [actionName, relative("src", path)])
  )
);

if (entries.length === 0) {
  console.error("No lambda entries found in manifest.json");
  process.exit(1);
}

export default defineConfig(
  entries.map(
    (entry) =>
      ({
        input: `${entry}?lambda-entry=true`,
        output: {
          dir: `dist/lambda/${basename(entry, ".ts")}`,
          format: "esm",
          entryFileNames: "index.mjs",
        },
        platform: "node",
        external: [/@aws-sdk\/.+/],
        plugins: [
          {
            name: "lambda-transform",
            resolveId(source) {
              if (source.endsWith("?lambda-entry=true")) {
                return source;
              }
            },
            load(id) {
              if (id.endsWith("?lambda-entry=true")) {
                const functionName = basename(
                  id.replace("?lambda-entry=true", ""),
                  ".ts"
                ).replace(/action-/, "");
                const originalEntryPath = basename(
                  functionNameToDefinedPath[functionName],
                  ".ts"
                );
                const code = `
            import { ${functionName} } from "./${originalEntryPath}.js";
            export const handler = async (event) => {
              const result = await ${functionName}(...event)
              return JSON.stringify(result)
            }
          `;
                return code;
              }
            },
          },
        ],
      } satisfies RolldownOptions)
  )
);
