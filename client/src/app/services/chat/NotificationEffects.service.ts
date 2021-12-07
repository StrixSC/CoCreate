import { Injectable, EventEmitter } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class NotificationEffectsService {
  msgNotification: HTMLAudioElement;

  constructor() {
    this.msgNotification = new Audio();
  }
}
