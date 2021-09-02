export interface Drawing {
    name: string;
    fileName: string;
    createdAt: Date;
    tags: string[];
    path: string;
}

export interface Tag {
    name: string;
    numberOfUses: number;
}
