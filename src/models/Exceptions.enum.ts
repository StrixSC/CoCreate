export enum ExceptionType {
    Collaboration = "collaboration:exception",
    Collaboration_Create = "collaboration:create:exception",
    Collaboration_Join = "collaboration:join:exception",
    Collaboration_Update = "collaboration:update:exception",
    Collaboration_Leave = "collaboration:leave:exception",
    Collaboration_Disconnect = "collaboration:disconnect:exception",
    Collaboration_Delete = "collaboration:delete:exception",
    Collaboration_Connect = "collaboration:connect:exception",

    Drawing = "drawing:exception",

    Teams = "teams:exception",
    Teams_Create = "teams:create:exception",
    Teams_Join = "teams:join:exception",
    Teams_Leave = "teams:leave:exception",
    Teams_Delete = "teams:delete:exception",
    User_Init = "user:init:exception",

    Channel_Create = "channel:create:exception",
    Channel_Delete = "channel:delete:exception",
    Channel_Join = "channel:join:exception",
    Channel_Update = "channel:update:exception",
    Channel_Leave = "channel:leave:exception",
    Channels = "channel:exception",
    Channel_Send = "channel:send:exception",
}

export enum EventFinishedType {
    Collaboration_Update = "collaboration:update:finished",
    Collaboration_Create = "collaboration:create:finished",
    Collaboration_Leave = "collaboration:leave:finished",
    Collaboration_Disconnect = "collaboration:disconnect:finished",
    Collaboration_Connect = "collaboration:connect:finished",
    Collaboration_Delete = "collaboration:delete:finished",
    Collaboration_Join = "collaboration:join:finished",

    Teams_Create = "teams:create:finished",
    Teams_Join = "teams:join:finished",
    Teams_Leave = "teams:leave:finished",
    Teams_Delete = "teams:delete:finished",

    Channel_Create = "channel:create:finished",
    Channel_Delete = "channel:delete:finished",
    Channel_Leave = "channel:leave:finished",
    Channel_Join = "channel:join:finished",
    Channel_Update = "channel:update:finished",
    Channel_Send = "channel:send:finished",
}