import { TogglApiClient } from "./TogglApiClient";

export default class TogglTimeEntry {
  private togglApiClient: TogglApiClient;
  private timer: number | null = null;
  private runningTimeEntry: { id: string; start: Date } | null = null;
  private onStart: () => void;
  private onProgress: (msDuration: number) => void;
  private onStop: () => void;

  constructor(
    togglApiClient: TogglApiClient,
    {
      onStart,
      onProgress,
      onStop
    }: {
      onStart: () => void;
      onProgress: (msDuration: number) => void;
      onStop: () => void;
    }
  ) {
    this.togglApiClient = togglApiClient;
    this.onStart = onStart;
    this.onProgress = onProgress;
    this.onStop = onStop;
  }

  private async start(description: string, extraTags?: string[]) {
    if (this.runningTimeEntry) return;

    try {
      const result = await this.togglApiClient.startTimeEntry(
        description,
        extraTags
      );
      this.runningTimeEntry = {
        id: result.data.data.id,
        start: new Date(result.data.data.start)
      };
      this.startNotifyProgress();
    } catch {}
  }

  private async stop() {
    if (!this.runningTimeEntry) return;

    try {
      await this.togglApiClient.stopTimeEntry(this.runningTimeEntry.id);
      this.runningTimeEntry = null;
      this.stopNotifyProgress();
    } catch {}
  }

  private startNotifyProgress() {
    this.onStart();
    this.timer = setInterval(() => {
      if (!this.runningTimeEntry) {
        this.stopNotifyProgress();
        return;
      }
      const msDuration =
        new Date().getTime() - this.runningTimeEntry.start.getTime();
      this.onProgress(msDuration);
    }, 1000);
  }

  private stopNotifyProgress() {
    this.onStop();
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async toggle(description: string, extraTags?: string[]) {
    if (!this.runningTimeEntry) {
      await this.start(description, extraTags);
    } else {
      await this.sync();
      await this.stop();
    }
  }

  async sync() {
    try {
      const result = await this.togglApiClient.getRunningTimeEntry();
      const runningTimeEntry = result.data.data;
      const isSameRunningTimeEntry =
        runningTimeEntry &&
        this.runningTimeEntry &&
        runningTimeEntry.id !== this.runningTimeEntry.id;

        if (
        (runningTimeEntry && !this.runningTimeEntry) ||
        isSameRunningTimeEntry
      ) {
        this.runningTimeEntry = {
          id: runningTimeEntry.id,
          start: new Date(runningTimeEntry.start)
        };
        this.startNotifyProgress();
      }

      if (!runningTimeEntry && this.runningTimeEntry) {
        this.runningTimeEntry = null;
        this.stopNotifyProgress();
      }
    } catch {}
  }
}
