import * as vscode from "vscode";

const API_TOKEN = "API_TOKEN";

export const askTooglApiToken = async (
  globalState: vscode.Memento
): Promise<string | undefined> => {
  const inputResult = await vscode.window.showInputBox({
    placeHolder: "Enter your Toggl API token"
  });
  if (inputResult) {
    globalState.update(API_TOKEN, inputResult);
  }
  return inputResult;
};

export const getTooglApiToken = async (
  globalState: vscode.Memento
): Promise<string | undefined> => {
  let apiToken = globalState.get<string>(API_TOKEN);

  if (!apiToken) {
    return askTooglApiToken(globalState);
  }

  return apiToken;
};
