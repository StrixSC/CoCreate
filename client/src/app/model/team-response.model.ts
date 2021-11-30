export enum TeamType {
    Protected = "Protected",
    Public = "Public",
    None = ""
}

export enum MemberType {
    Owner = "Owner",
    Regular = "Regular",
}

export interface TeamResponse {
    teamId: string,
    createdAt: string,
    teamName: string,
    bio: string,
    maxMemberCount: number,
    type: string,
    avatarUrl: string,
    mascot: string,
    authorUsername: string,
    authorAvatarUrl: string,
    team_members: { member_id: string, member_type: MemberType }[],
    isMember: boolean,
    isOwner: boolean
    onlineMemberCount: number,
}
