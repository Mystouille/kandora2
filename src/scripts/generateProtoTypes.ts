#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from "fs";
import { Root } from "protobufjs";
import { resolve } from "path";

/**
 * Generate TypeScript definition files from proto.json files
 * Usage: tsx src/scripts/generateProtoTypes.ts <input.proto.json> <output.d.ts>
 */

async function generateTypes(
  inputPath: string,
  outputPath: string
): Promise<void> {
  try {
    // Read the proto.json file
    const protoJson = JSON.parse(readFileSync(inputPath, "utf-8"));

    // Load the protobuf root from JSON
    const root = Root.fromJSON(protoJson);

    // Generate TypeScript definitions
    const pbts = require("protobufjs-cli/pbts");

    // Use pbts programmatically
    pbts.main(
      ["--input", inputPath, "--output", outputPath, "--no-comments", "-"],
      (err: any) => {
        if (err) {
          console.error("Error generating types:", err);
          process.exit(1);
        } else {
          console.log(`✅ Successfully generated ${outputPath}`);
        }
      }
    );
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log(
    "Usage: tsx generateProtoTypes.ts <input.proto.json> <output.d.ts>"
  );
  console.log("Example: tsx generateProtoTypes.ts proto.json proto.d.ts");
  process.exit(1);
}

const [inputPath, outputPath] = args.map((p) => resolve(p));

generateTypes(inputPath, outputPath);
