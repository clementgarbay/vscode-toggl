import * as vscode from "vscode";

const formatStatusBarItemText = (content: string): string => {
  return `$(primitive-dot) Toggl ${content}`;
};

export const createStatusBarItem = () => {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    -1
  );
  statusBarItem.color = "#e20605";
  statusBarItem.command = "toggl.openToggl";

  return {
    display: (content: string) => {
      statusBarItem.text = formatStatusBarItemText(content);
      statusBarItem.show();
    },
    clear: () => {
      statusBarItem.text = "";
      statusBarItem.hide();
    }
  };
};
