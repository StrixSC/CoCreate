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
    authored_collaborations: AuthoredCollaboration[];
    collaborations: Collaboration[];
    teams: any[];
    profile: Profile;
    logs: Log[];
    account: Account;
    stats: Stats;
}

export interface AuthoredCollaboration {
    author_id: string;
}

export interface Collaboration {
    collaboration_id: string;
}

export interface Account {
    first_name: string;
    last_name: string;
    allow_searching: boolean;
}

export interface Stats {
    total_collaboration_time: string;
    total_collaboration_sessions: number;
    updated_at: Date;
    average_collaboration_time: string;
    authored_collaboration_count: number;
    joined_collaboration_count: number;
    team_count: number;
}
