export interface IUser {
    username: string;
    user_id: string;
    email: string;
    avatar_url: string;
}

export enum UserStatusTypes {
    Offline = "Hors-Ligne",
    Online = "En ligne",
    Busy = "Occupé"
}

export interface IConnectionEventData {
    userId: string,
    roomId: string,
    username: string,
    avatarUrl: string,
    status: string,
    onlineMemberCount?: number
}