export interface Drawing1 {
    drawing_id: string;
    collaboration_id?: string;
    type: string;
    title: string;
    created_at: string;
    updated_at?: string
    owner?: string;
    author_username: string;
    author_avatar?: string;
    collaboration_count: number;
    max_collaborator_count?: string;
    img: string;
}