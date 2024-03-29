import moment from 'moment';
import { UserStatusTypes } from './../models/IUser.model';
import { Socket } from 'socket.io';
import { Action, Stats, Collaboration, CollaborationMember, Drawing, MemberType, Profile, User } from "@prisma/client";
import { getOnlineMembersInRoom } from "./socket";

type CollaborationMemberConnectionResponse = CollaborationMember & {
    user: User & {
        profile: Profile | null;
    };
    collaboration: Collaboration & {
        drawing: Drawing | null;
        actions: Action[];
        collaboration_members: (CollaborationMember & {
            user: User & {
                profile?: Profile | null
            }
        })[];
    };
}

export const triggerJoin = (socket: Socket, member: any) => {
    socket.data.status = UserStatusTypes.Busy;
    socket.data.startTime = new Date();
    socket.data.activeChannelId = member.collaboration.channel_id;
    socket.data.activeCollaborationId = member.collaboration_id;
    socket.join(member.collaboration.channel_id);
    socket.join(member.collaboration_id);
    const data = generateConnectedPayload(member);
    socket.emit("collaboration:load", data);
}

export const computeUserUpdatedStats = (socket: Socket, stats: Stats) => {
    const previousTotalTime = stats.total_collaboration_time;
    const endTime = moment(new Date());
    let startTime = moment((socket.data.startTime) as Date);
    const totalTime = endTime.diff(startTime);
    const newTotalTime = previousTotalTime + totalTime;
    const newCollabSessionCount = stats.total_collaboration_sessions + 1;
    return { time: newTotalTime, collabs: newCollabSessionCount };
}

export const generateConnectedPayload = (member: CollaborationMemberConnectionResponse) => {
    const onlineMembers = getOnlineMembersInRoom(member.collaboration_id);

    return {
        collaborationId: member.collaboration.collaboration_id,
        actions: member.collaboration.actions,
        memberCount: member.collaboration.collaboration_members.length,
        title: member.collaboration.drawing!.title,
        authorUsername: member.collaboration.collaboration_members
            .find((c) => c.type === MemberType.Owner)!.user.profile!.username || "Admin",
        authorAvatar: member.collaboration.collaboration_members
            .find((c) => c.type === MemberType.Owner)!.user.profile?.avatar_url || "",
        members: member.collaboration.collaboration_members
            .filter((m) => m.type === MemberType.Regular)
            .map((m) => ({
                avatarUrl: m.user.profile!.avatar_url,
                username: m.user.profile!.username,
                isOnline: onlineMembers.find((om: any) => om.userId === member.user_id) ? true : false
            })),
        backgroundColor: member.collaboration.drawing!.background_color,
        width: member.collaboration.drawing!.width,
        height: member.collaboration.drawing!.height,
        drawingId: member.collaboration.drawing!.drawing_id,
    }
};