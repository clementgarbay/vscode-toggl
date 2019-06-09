import * as createSimpleGit from "simple-git";
import { getWorkspaceFolderPath } from "./utils";

export const getBranchName = (): Promise<string> => {
  return new Promise(resolve => {
    const workspaceFolderPath = getWorkspaceFolderPath();

    if (!workspaceFolderPath) return;

    try {
      const simpleGit = createSimpleGit(workspaceFolderPath);
      simpleGit.branchLocal((error, data) => {
        resolve(error ? undefined : data.current);
      });
    } catch (error) {
      resolve();
    }
  });
};
