export interface IUserComplete {
    profile: {
        username: string;
        avatar_url: string;
    };
    account: {
        first_name: string;
        last_name: string;
    };
    stats: {
        collaboration_count: string;
        author_count: number;
        active_team_count: string;
        average_collaboration_time: string;
        total_collaboration_time: string;
    };
    logs: {
        created_at: string;
        type: string;
        drawing_id?: string;
    }[];

    email: string;
    user_id: string;
}
