import * as vscode from "vscode";
import { TogglApiClient, TogglApiError } from "./toggl/TogglApiClient";
import { askTooglApiToken, getTooglApiToken } from "./extensionHelpers";
import TogglTimeEntry from "./toggl/TogglTimeEntry";
import { createStatusBarItem } from "./statusBarItem";
import { getBranchName } from "./git";
import { getWorkspaceFolderName } from "./utils";

export const activate = async ({
  globalState,
  subscriptions
}: vscode.ExtensionContext) => {
  // Create status bar item
  const statusBarItem = createStatusBarItem();

  // Create Toggl API client
  const togglApiClient = new TogglApiClient({
    getApiToken: async () => {
      const apiToken = await getTooglApiToken(globalState);
      if (!apiToken) {
        vscode.window.showErrorMessage("Toggl API token is required");
        return "";
      }
      return apiToken;
    },
    onResponseError: async (error: TogglApiError) => {
      if (error.code === "authenticationError") {
        vscode.window.showErrorMessage(
          "Authentication error while contacting Toggl"
        );
        statusBarItem.clear();
      } else {
        vscode.window.showErrorMessage("Something went wrong :(");
      }
    }
  });

  // Create Toggl time entry manager
  const togglTimeEntry = new TogglTimeEntry(togglApiClient, {
    onStart: () => {
      statusBarItem.display("starting...");
    },
    onProgress: msDuration => {
      let hours = Math.floor((msDuration / 1000 / 60 / 60) % 60);
      let minutes = Math.floor((msDuration / 1000 / 60) % 60)
        .toString()
        .padStart(2, "0");
      let seconds = Math.floor((msDuration / 1000) % 60)
        .toString()
        .padStart(2, "0");
      statusBarItem.display(`${hours}:${minutes}:${seconds}`);
    },
    onStop: () => {
      statusBarItem.clear();
    }
  });

  // Register extension commands
  subscriptions.push(
    vscode.commands.registerCommand("toggl.track", async () => {
      const gitRepositorybranchName = await getBranchName();
      const folderName = getWorkspaceFolderName() || "VSCode";
      const extraTags = vscode.workspace
        .getConfiguration("toggl")
        .get<string[]>("extraTags");
      await togglTimeEntry.toggle(
        gitRepositorybranchName || folderName,
        extraTags
      );
    }),
    vscode.commands.registerCommand("toggl.setToken", async () => {
      const apiToken = await askTooglApiToken(globalState);
      if (!apiToken) {
        vscode.window.showErrorMessage("Toggl API token is required");
      }
    }),
    vscode.commands.registerCommand("toggl.openToggl", async () => {
      vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.parse("https://toggl.com/app/timer")
      );
    })
  );
};
