import { Injectable } from "@angular/core";
import { contextBridge, IpcRenderer, ipcRenderer } from "electron";

// export type Api = {
//   send: (channel: string, ...args: any[]) => void;
//   invoke: (channel: string, ...args: any[]) => Promise<any>;
//   on: (channel: string, listener: any) => void;
//   once: (channel: string, listener: any) => void;
//   removeAllListeners: (channel: string) => void;
// };

// declare global {
//   interface Window {
//     ElectronBridge: Api;
//   }
// }

// contextBridge.exposeInMainWorld("ElectronBridge", {
//   send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
//   invoke: (channel: string, ...args: any[]) =>
//     ipcRenderer.invoke(channel, ...args),
//   on: (channel: string, listener: any) => ipcRenderer.on(channel, listener),
//   once: (channel: string, listener: any) => ipcRenderer.once(channel, listener),
//   removeAllListeners: (channel: string) =>
//     ipcRenderer.removeAllListeners(channel),
// });

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
    // this._ipc = window.require("electron").ipcRenderer;
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
