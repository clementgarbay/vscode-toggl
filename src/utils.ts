import * as vscode from "vscode";

export const getWorkspaceFolderName = () => {
  if (!vscode.workspace.workspaceFolders) return;
  return vscode.workspace.workspaceFolders[0].name;
};

export const getWorkspaceFolderPath = () => {
  if (!vscode.workspace.workspaceFolders) return;
  return vscode.workspace.workspaceFolders[0].uri.fsPath;
};
