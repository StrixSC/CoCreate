import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ISendCoordPayload } from "../model/ISendCoordPayload.model";
import { SocketService } from "./chat/socket.service";

@Injectable({
  providedIn: "root",
})
export class SynchronizeDrawingService {
  x: number;
  y: number;
  constructor(private socket: SocketService) {}

  sendMessage(
    x_: number,
    y_: number,
    state_: string,
    actionId_: string,
    offsetX_: number,
    offsetY_: number,
    pageX_: number,
    pageY_: number
  ): void {
    this.socket.emit("freedraw:emit", {
      x: x_,
      y: y_,
      state: "move", // down, move, up
      actionId: "pencil",
      offsetX: offsetX_,
      offsetY: offsetY_,
      pageX: pageX_,
      pageY: pageY_,
    } as ISendCoordPayload);
  }

  receiveMessage(): Observable<ISendCoordPayload> {
    return this.socket.on("freedraw:receive");
  }
}
