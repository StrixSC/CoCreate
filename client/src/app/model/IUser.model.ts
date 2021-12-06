export interface IUser {
    username: string;
    userId: string;
    email: string;
    avatar_url: string;
}

export interface Profile {
    username: string;
    avatar_url: string;
}

export interface Log {
    type: string;
    created_at: Date;
    collaboration_id?: any;
}

export interface Account {
    first_name: string;
    last_name: string;
    allow_searching: boolean;
}

export interface UserResponse {
    user_id: string;
    email: string;
    profile: Profile;
    logs: Log[];
    account: Account;
    stats?: any;
}
