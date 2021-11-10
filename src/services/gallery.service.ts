import { MemberType } from '.prisma/client';
import { db } from "../db";

export const getDrawingsWithFilter = async (filter: string, offset: number, limit: number) => {
    const result = await db.drawing.findMany({
        skip: offset,
        take: limit,
        include: {
            collaboration: {
                include: {
                    collaboration_members: {
                        include: {
                            user: {
                                include: {
                                    profile: true,
                                    account: true,
                                }
                            }
                        }
                    }
                },
            }
        }
    });

    const drawings = result.map((d) => ({
        collaboration_id: d.collaboration_id,
        drawing_id: d.drawing_id,
        created_at: d.collaboration.created_at,
        updated_at: d.collaboration.updated_at,
        author: d.collaboration.collaboration_members.find((m) => m.type === MemberType.Owner)?.user || null,
        title: d.title
    }));

    const filteredDrawings = await db.drawing.findMany({
        where: {
            OR: [
                {
                    title: {
                        in: filter
                    },
                    created_at: {
                        equals: filter
                    },
                    updated_at: {
                        equals: filter
                    },
                    collaboration: {
                        collaboration_members: {
                            every: {
                                type: MemberType.Owner,
                                user: {
                                    account: {
                                        allow_searchig: true
                                    }
                                }
                            }
                        }
                    }
                }
            ]

        }
    });

    return filteredDrawings;
};
