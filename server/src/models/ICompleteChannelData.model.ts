import { ChannelType, MemberType } from '.prisma/client';

export interface ICompleteChannelData {
    name: string;
    created_at: Date;
    type: ChannelType;
    collaboration_id: string | null;
    updated_at: Date;
    channel_id: string;
    members: {
        type: MemberType;
        member: {
            profile: {
                username: string;
                avatar_url: string;
            } | null;
        };
        messages: {
            message_data: string;
            created_at: Date;
        }[];
    }[];
}
