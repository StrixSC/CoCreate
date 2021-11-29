import { Team, MemberType, User, Account, Profile, TeamType } from '@prisma/client';

export interface GetTeamsPayload {
    userId: string;
    type: TeamType | null;
    filter: string | null;
    offset: number;
    limit: number;
    removeFull: boolean | null;
    amOwner: boolean | null;
    amMember: boolean | null;
}

export type TeamQueryInterface = (Team & {
    team_members: {
        type: MemberType;
        user_id: string;
        user: User & {
            profile: Profile | null;
            account: Account | null;
        };
    }[];
})[]

export interface TeamResponse {
    teamId: string,
    createdAt: string,
    teamName: string,
    bio: string,
    maxMemberCount: number,
    currentMemberCount: number,
    type: string,
    avatarUrl: string,
    mascot: string,
    authorUsername: string,
    authorAvatarUrl: string,
    teamMembers: { avatarUrl: string, username: string, type: MemberType }[],
    isMember: boolean,
    isOwner: boolean,
}