import { Injectable, EventEmitter } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class NotificationEffectsService {
  msgNotification: HTMLAudioElement;
  leaveChannelNotification: HTMLAudioElement;

  constructor() {
    this.msgNotification = new Audio();
    this.leaveChannelNotification = new Audio();
  }
}
