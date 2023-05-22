import chalk from "chalk";
import * as fs from "fs";
// import fsExtra from "fs-extra";
import path from "path";
import * as ts from "typescript";
import { Structure, Property } from "../../types";
import { initialize } from "./initialize-playground";

export function printSuggestedCommands (projectName: string): void {
  const currDir = process.cwd();
  const projectPath = path.join(currDir, projectName);
  console.log(`Success! Created project at ${chalk.greenBright(projectPath)}.`);
  // TODO: console.log(`Inside that directory, you can run several commands:`);
  // list commands and respective description

  console.log(`Begin by typing:`);
  console.log(`  cd ${projectName}`);
  console.log(`  npm install`);
  console.log(`  npm start`);
}

function createArtifactJson (contractDir: string, destinationDir: string): void {
  const files = fs.readdirSync(contractDir); // Get an array of all files in the directory
  const json = [];
  console.log("\n", files);
  for (const file of files) {
    if (file.endsWith(".wasm") && (!file.endsWith("_compressed.wasm"))) {
      const name = file.slice(0, -5); // Remove the last 5 characters (".wasm") from the filename
      json.push(name);
    }
  }
  const dest = path.join(destinationDir, "contracts.json");

  fs.writeFileSync(dest, JSON.stringify(json)); // Write the JSON file to disk
}

function convertTypescriptFileToJson (
  inputFilePath: string,
  outputFilePath: string
): void {
  const sourceFile = ts.createSourceFile(
    inputFilePath,
    fs.readFileSync(inputFilePath).toString(),
    ts.ScriptTarget.Latest
  );
  const structures: Structure[] = [];

  function parseNode (node: ts.Node): void {
   
   if (ts.isInterfaceDeclaration(node)) {
      const properties: Property[] = node.members
        .filter(ts.isPropertySignature)
        .map((member) => ({
          name: member.name.getText(sourceFile),
          type: member.type?.getText(sourceFile) ?? "unknown",
          modifiers: member.modifiers?.map((modifier) => modifier.getText(sourceFile))
        }));
      structures.push({
        kind: "interface",
        name: node.name?.getText(sourceFile) ?? "unknown",
        properties
      });
    } 
    ts.forEachChild(node, parseNode);
  }

  parseNode(sourceFile);

  fs.writeFileSync(outputFilePath, JSON.stringify(structures, null, 2));
}
function processFilesInFolder(folderPath: string, destPath: string) {
  const files = fs.readdirSync(folderPath);

    files.forEach(file => {
      const filePath = path.join(folderPath,file);
      const fileName = path.parse(file).name;
      const schemaDest = path.join(destPath,fileName+".json");
      console.log(schemaDest);
      convertTypescriptFileToJson(filePath, schemaDest);
    });
  
}

export async function createPlayground (
  projectName: string,
  templateName: string,
  destination: string
  // eslint-disable-next-line
): Promise<any> {
  if (templateName !== undefined) {
    const currDir = process.cwd();
    const artifacts = path.join(currDir, "artifacts");
    if (!fs.existsSync(artifacts)) {
      console.log("no artifacts found");
      return;
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
    const schemaDest = path.join(playgroundDest,"schema"); //here contract name is stored.
    const contracts = path.join(artifacts, "contracts");
   

    createArtifactJson(contracts, playgroundDest);
    const contractsSchema = path.join(artifacts, "typescript_schema");

    fs.mkdir(schemaDest, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating folder:', err);
      } else {
        console.log('Folder created successfully!');
      }
    });
    processFilesInFolder(contractsSchema,schemaDest);
    return;
  }

  console.log(chalk.cyan(`★ Welcome to Junokit Playground v1.0 ★`));
  console.log("\n★", chalk.cyan("Project created"), "★\n");

  printSuggestedCommands(projectName);
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

// function isInstalled (dep: string): boolean {
//   const packageJson = fsExtra.readJSONSync("package.json");
//   const allDependencies = {
//     ...packageJson.dependencies,
//     ...packageJson.devDependencies,
//     ...packageJson.optionalDependencies
//   };

//   return dep in allDependencies;
// }

// function isYarnProject (): boolean {
//   return fsExtra.pathExistsSync("yarn.lock");
// }
