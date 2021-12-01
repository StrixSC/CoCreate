import { Injectable } from "@angular/core";
import { IpcRenderer } from "electron";

declare var window: Window;
declare global {
  interface Window {
    process: any;
    require: any;
  }
}

@Injectable({ providedIn: "root" })
export class IpcService {
  private _ipc: IpcRenderer | undefined = void 0;
  readonly NOTIFICATION_CHANNEL = "notification";

  constructor() {
    if (window.require) this._ipc = window.require("electron").ipcRenderer;
    else console.error("NOTIFICATIONS WILL NOT WORK ON WEB BROWSER!");
  }

  public on(channel: string, listener: any): void {
    if (!this._ipc) return;
    this._ipc.on(channel, listener);
  }

  public send(text_channel: string, message: string): void {
    if (!this._ipc) return;
    this._ipc.send(this.NOTIFICATION_CHANNEL, message, text_channel, message);
  }
}
