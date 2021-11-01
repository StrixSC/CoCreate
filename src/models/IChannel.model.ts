export interface IChannel {
    name: string;
    channel_id: string;
    type: string;
    collaboration_id: string | null;
    updated_at: Date;
    ownerUsername: string;
}
