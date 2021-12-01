export interface IGalleryEntry {
    is_member: string;
    is_owner: string;
    drawing_id: string;
    collaboration_id?: string;
    userId?: string
    type: string;
    title: string;
    created_at: string;
    updated_at?: string
    owner?: string;
    author_username: string;
    author_avatar?: string;
    collaborator_count: number;
    max_collaborator_count?: number;
    img: string;
}
export interface IConnectCollaboration {
    userId: string;
    collaborationId: string;
}
export interface ICreateCollaboration {
    userId: string,
    title: string,
    type: string, 		// "Protected" or "Public" or "Private"
    password?: string 	// Mandatory if the type is "Protected"
}
export interface IDeleteCollaboration {
    userId: string,
    collaborationId: string
}
export interface IJoinCollaboration {
    userId: string;
    collaborationId: string;
    type: string;	// "Protected", "Public" or "Private"
    password?: string; // Mandatory if the type is "Protected"
}
export interface ILeaveCollaboration {
    collaborationId: string,
    userId: string
}
export interface IUpdateCollaboration {
    userId: string,
    collaborationId: string,
    title: string,
    type: string, 		// "Protected" or "Public" or "Private"
    password?: string 	// Mandatory if the type is "Protected"
}