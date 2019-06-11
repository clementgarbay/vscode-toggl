import axios, { AxiosInstance } from "axios";
import { getWorkspaceFolderName } from "../utils";

export type TogglApiError =
  | { code: "authenticationError" }
  | { code: "unknown" };

export class TogglApiClient {
  togglApi: AxiosInstance;

  constructor({
    getApiToken,
    onResponseError = () => Promise.resolve()
  }: {
    getApiToken: () => Promise<string>;
    onResponseError: (error: TogglApiError) => Promise<void>;
  }) {
    this.togglApi = axios.create({
      baseURL: "https://www.toggl.com/api/v8/"
    });

    this.togglApi.interceptors.request.use(async request => {
      if (!request.auth || (request.auth && !request.auth.username)) {
        request.auth = {
          username: await getApiToken(),
          password: "api_token"
        };
      }
      return request;
    });

    this.togglApi.interceptors.response.use(
      response => response,
      async error => {
        console.log(error);
        if (error.response.status === 403) {
          await onResponseError({ code: "authenticationError" });
        } else {
          await onResponseError({ code: "unknown" });
        }
        return Promise.reject(error);
      }
    );
  }

  async startTimeEntry(description: string, extraTags: string[] = []) {
    const folderName = getWorkspaceFolderName()!;
    return this.togglApi.post("/time_entries/start", {
      time_entry: {
        description,
        tags: [folderName, ...extraTags],
        created_with: "vscode-toggl"
      }
    });
  }

  async stopTimeEntry(timeEntryId: string) {
    return this.togglApi.put(`/time_entries/${timeEntryId}/stop`);
  }

  async getRunningTimeEntry() {
    return this.togglApi.get('/time_entries/current');
  }
}
