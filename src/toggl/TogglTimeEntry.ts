import { TogglApiClient } from "./TogglApiClient";

export default class TogglTimeEntry {
  private togglApiClient: TogglApiClient;
  private timer: number | null = null;
  private ongoingTimeEntry: { id: string; start: Date } | null = null;
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
    if (this.ongoingTimeEntry) return;

    try {
      this.onStart();
      const result = await this.togglApiClient.startTimeEntry(
        description,
        extraTags
      );
      this.ongoingTimeEntry = {
        id: result.data.data.id,
        start: new Date(result.data.data.start)
      };
    } catch {}
  }

  private async stop() {
    if (!this.ongoingTimeEntry) return;

    try {
      await this.togglApiClient.stopTimeEntry(this.ongoingTimeEntry.id);
      this.ongoingTimeEntry = null;
      this.stopNotifyProgress();
      this.onStop();
    } catch {}
  }

  private startNotifyProgress() {
    this.timer = setInterval(() => {
      if (!this.ongoingTimeEntry) {
        this.stopNotifyProgress();
        return;
      }
      const msDuration =
        new Date().getTime() - this.ongoingTimeEntry.start.getTime();
      this.onProgress(msDuration);
    }, 1000);
  }

  private stopNotifyProgress() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async toggle(description: string, extraTags?: string[]) {
    if (!this.ongoingTimeEntry) {
      await this.start(description, extraTags);
      this.startNotifyProgress();
    } else {
      await this.stop();
    }
  }

  getCurrentTimeEntryId() {
    if (!this.ongoingTimeEntry) return;
    return this.ongoingTimeEntry.id;
  }
}
