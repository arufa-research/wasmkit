import chalk from "chalk";
import { ExecException } from "child_process";
import * as fs from "fs";
import fsExtra from "fs-extra";
import * as yaml from "js-yaml";
import path from "path";
import * as ts from "typescript";

import { CounterData, Property, Structure, WasmkitRuntimeEnvironment } from "../../types";
import { WasmkitError } from "../core/errors";
import { ERRORS } from "../core/errors-list";
import { initialize } from "./initialize-playground";
export function printSuggestedCommands (
  projectName: string,
  packageManager: string,
  shouldShowInstallationInstructions: boolean
): void {
  const currDir = process.cwd();
  const projectPath = path.join(currDir, projectName);
  console.log(`Success! Created project at ${chalk.greenBright(projectPath)}.`);

  console.log(`Begin by typing:`);
  console.log(chalk.yellow(`  cd ${projectName}`));
  if (shouldShowInstallationInstructions) {
    console.log(chalk.yellow(`  ${packageManager} install`));
  }
  console.log(chalk.yellow(`  ${packageManager} start`));
}

function createContractListJson (contractDir: string, destinationDir: string): void {
  const files = fs.readdirSync(contractDir); // Get an array of all files in the directory
  const dest = path.join(destinationDir, "contractList.json");
  for (const file of files) {
    const fileName = path.parse(file).name;
    const filePath = path.join(contractDir, file);
    const yamlFile = fs.readFileSync(filePath, "utf8");
    const yamlData = yaml.load(yamlFile) as CounterData;
    const codeId = yamlData.default.deployInfo.codeId;
    const contractAddress = yamlData.default.instantiateInfo[0].contractAddress;
    const jsonData = {
      [fileName]: {
        codeId,
        contractAddress
      }
    };
    let existingData: Record<string, unknown> = {};
    if (fs.existsSync(dest)) {
      const existingContent = fs.readFileSync(dest, "utf8");
      existingData = JSON.parse(existingContent);
    }
    const mergedData = { ...existingData, ...jsonData };
    fs.writeFileSync(dest, JSON.stringify(mergedData, null, 2));
  }
}

function convertTypescriptFileToJson (
  inputFilePath: string,
  outputFilePath: string,
  name: string
): void {
  const sourceFile = ts.createSourceFile(
    inputFilePath,
    fs.readFileSync(inputFilePath).toString(),
    ts.ScriptTarget.Latest
  );
  const structures: Structure[] = [];

  function parseNode (node: ts.Node): void {
    if (ts.isClassDeclaration(node)) {
      const properties: Property[] = node.members
        .filter(ts.isPropertyDeclaration)
        .map((member) => ({
          name: member.name.getText(sourceFile),
          type: member.type?.getText(sourceFile) ?? "unknown",
          modifiers: member.modifiers?.map((modifier) => modifier.getText(sourceFile))
        }));
      structures.push({
        kind: "class",
        name: node.name?.getText(sourceFile) ?? "unknown",
        properties
      });
    } else if (ts.isInterfaceDeclaration(node)) {
      const properties: Property[] = node.members
        .filter(ts.isPropertySignature)
        .map((Member) => ({
          name: Member.name.getText(sourceFile),
          type: Member.type?.getText(sourceFile) ?? "unknown",
          modifiers: Member.modifiers?.map((modifier) => modifier.getText(sourceFile))
        }));
      structures.push({
        kind: "interface",
        name: node.name?.getText(sourceFile) ?? "unknown",
        properties
      });
    } else if (ts.isTypeAliasDeclaration(node)) {
      structures.push({
        kind: "typeAlias",
        name: node.name?.getText(sourceFile) ?? "unknown",
        properties: [
          {
            name: "type",
            type: node.type?.getText(sourceFile) ?? "unknown"
          }
        ]
      });
    }

    ts.forEachChild(node, parseNode);
  }

  parseNode(sourceFile);
  const schemaData = structures;
  const jsonData = {
    [name]: {
      schemaData
    }
  };
  let existingData: Record<string, unknown> = {};
  if (fs.existsSync(outputFilePath)) {
    const existingContent = fs.readFileSync(outputFilePath, "utf8");
    existingData = JSON.parse(existingContent);
  }
  const mergedData = { ...existingData, ...jsonData };
  fs.writeFileSync(outputFilePath, JSON.stringify(mergedData, null, 2));
}
function processFilesInFolder (folderPath: string, destPath: string): void {
  const files = fs.readdirSync(folderPath);
  const fileName = "contractSchema";
  const schemaDest = path.join(destPath, fileName + ".json");
  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const name = path.parse(file).name;
    convertTypescriptFileToJson(filePath, schemaDest, name);
  });
}

function createDir (dir: string): void {
  fs.mkdir(dir, { recursive: true }, (err) => {
    if (err) {
      console.error("error", err);
    }
  });
}

function copyStaticFiles (
  srcPath: string,
  destinationPath: string,
  env: WasmkitRuntimeEnvironment
): void {
  if (env.config.playground) {
    const data: any = env.config.playground;
    for (const key in data) {
      if (data[key].length !== 0) {
        handleStaticFile(path.join(srcPath, data[key]), path.join(destinationPath), key);
      }
    }
  }
}

function handleStaticFile (srcPath: string, destinationPath: string, name: string): void {
  const fileExtension = path.extname(srcPath);
  const Img = fs.readFileSync(srcPath);
  const Dest = path.join(destinationPath, `${name}${fileExtension}`);
  fs.writeFileSync(Dest, Img);
}
export async function createPlayground (
  projectName: string,
  templateName: string,
  destination: string,
  env: WasmkitRuntimeEnvironment
  // eslint-disable-next-line
): Promise<any> {
  if (templateName !== undefined) {
    const currDir = process.cwd();
    const artifacts = path.join(currDir, "artifacts");
    const checkpointsDir = path.join(artifacts, "checkpoints");
    // check existence of artifact directory
    if (!fs.existsSync(artifacts)) {
      throw new WasmkitError(ERRORS.GENERAL.ARTIFACTS_NOT_FOUND, {});
    } else if (!fs.existsSync(checkpointsDir)) {
      // check existence of checkpoint directory
      throw new WasmkitError(ERRORS.GENERAL.CHECKPOINTS_NOT_FOUND, {});
    }

    const projectPath = path.join(currDir, projectName);
    await initialize({
      force: false,
      projectName: projectName,
      templateName: templateName,
      destination: projectPath
    });

    const playground = path.join(currDir, "playground");
    const playgroundDest = path.join(playground, "src");
    const ContractDir = path.join(playgroundDest, "contracts");
    createDir(ContractDir);
    const schemaDest = path.join(ContractDir, "schema");
    const instantiateDir = path.join(ContractDir, "instantiateInfo");
    createDir(instantiateDir);
    createContractListJson(checkpointsDir, instantiateDir);
    const contractsSchema = path.join(artifacts, "typescript_schema");
    createDir(schemaDest);
    processFilesInFolder(contractsSchema, schemaDest);
    if (env.config.playground) {
      const staticFilesDest = path.join(playgroundDest, "assets", "img");
      const staticFilesSrc = path.join(currDir);
      copyStaticFiles(staticFilesSrc, staticFilesDest, env);
    }
    return;
  }
  console.log(chalk.cyan(`★ Welcome to Junokit Playground v1.0 ★`));
  console.log("\n★", chalk.cyan("Project created"), "★\n");
}

export function createConfirmationPrompt (
  name: string,
  message: string
  // eslint-disable-next-line
): any {
  // eslint-disable-line  @typescript-eslint/no-explicit-any
  return {
    type: "confirm",
    name,
    message,
    initial: "y",
    default: "(Y/n)",
    isTrue (input: string | boolean) {
      if (typeof input === "string") {
        return input.toLowerCase() === "y";
      }

      return input;
    },
    isFalse (input: string | boolean) {
      if (typeof input === "string") {
        return input.toLowerCase() === "n";
      }

      return input;
    },
    format (): string {
      const value = this.value === true ? "y" : "n";

      if (this.state.submitted === true) {
        return this.styles.submitted(value);
      }

      return value;
    }
  };
}
export async function installDependencies (
  packageManager: string,
  args: string,
  location?: string
): Promise<boolean> {
  const { exec } = await import("child_process");
  const command = packageManager + " " + args;
  return await new Promise((resolve, reject) => {
    const childProcess = exec(command, { cwd: location });

    childProcess.stdout?.on("data", (data: string) => {
      console.log(data.toString());
    });

    childProcess.stderr?.on("data", (data: string) => {
      console.error(data.toString());
    });

    childProcess.on("close", (code: number) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Command failed with code: ${code}`));
      }
    });

    childProcess.on("error", (error: ExecException) => {
      console.error("Error executing command:", error);
      reject(error);
    });
  });
}
