import { IAction } from './IAction.model';
export interface ICollaborationLoadResponse {
    actions: IAction[],
    memberCount: number,
    maxMemberCount: number,
    title: string,
    authorUsername: string,
    authorAvatar: string,
    members: { username: string, avatarUrl: string, isOnline: boolean }[],
    backgroundColor: string, // Hex value of the background color (Defaults to #FFFFFF)
    width: number,	// Width of the drawing (Defaults to 1280)
    height: number // Height of the drawing (Defaults to 752)
}

export interface ICollaborationJoinResponse {
    userId: string, // User Id of the new collaborator
    username: string // Username of the new collaborator
    avatarUrl: string // Avatar of the new collaborator
    collaborationId: string // Collaboration/Drawing that was joined.
}

export interface ICollaborationConnectResponse {
    userId: string,		// user id of the member that connected
    username: string,	// Username of the member that connected
    avatarUrl: string,	// Avatar of the member that connected 
    type: string		// Type of the member that connected ("Owner"/"Member")
}

export interface ICollaborationCreateResponse {
    collaborationId: string;
    title: string;
    thumbnailUrl: string;
    type: string;
    currentCollaboratorCount: number;
    maxCollaboratorCount: number;
    updatedAt: string;
    drawingId: string;
    createdAt: string;
    authorUsername: string;
    authorAvatarUrl: string
}

export interface ICollaborationUpdateResponse extends ICollaborationCreateResponse { }

export interface ICollaborationDeleteResponse {
    collaborationId: string,
    deletedAt: string // ISO Format
}

export interface ICollaborationLeaveResponse {
    collaborationId: string,
    userId: string,
    username: string,
    avatarUrl: string,
    leftAt: string, // ISO Format date
}

export interface ICollaborationJoinPayload {
    userId: string,
    collaborationId: string,
    type: string,	// "Protected", "Public" or "Private"
    password?: string // Mandatory if the type is "Protected"
}

export interface ICollaborationConnectPayload {
    userId: string,
    collaborationId: string,
}

export interface ICollaborationCreatePayload {
    userId: string,
    title: string,
    type: string, 		// "Protected" or "Public" or "Private"
    password?: string 	// Mandatory if the type is "Protected"
}

export interface ICollaborationDeletePayload {
    userId: string,
    collaborationId: string
}

export interface ICollaborationUpdatePayload {
    userId: string,
    collaborationId: string,
    title: string,
    type: string, 		// "Protected" or "Public" or "Private"
    password?: string 	// Mandatory if the type is "Protected"
}

export interface ICollaborationLeavePayload {
    collaborationId: string,
    userId: string
}