import { createPlayground } from "../internal/cli/playground-creation";
import { task } from "../internal/core/config/config-env";
import type { WasmkitRuntimeEnvironment } from "../types";
import { TASK_CREATE_PLAYGROUND } from "./task-names";
export default function (): void {
  task(TASK_CREATE_PLAYGROUND, "Initialize the playground in the project directory")
    .addFlag("withParam", "Add user defined logo and background")
    .setAction(playgroundTask);
}

export interface TaskArgs {
  projectName: string
  templateName: string
  destination: string
  withParam: boolean
}
async function playgroundTask (
  { projectName, templateName, destination, withParam }: TaskArgs,
  env: WasmkitRuntimeEnvironment
): Promise<void> {
  projectName = "playground";
  templateName = "playground";
  destination = process.cwd();
  return await createPlayground(projectName, templateName, destination, withParam, env);
}
