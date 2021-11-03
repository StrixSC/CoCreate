import { ChannelType, MemberType } from '.prisma/client';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const publicChannel = await prisma.channel.upsert({
        where: {
            channel_id: 'PUBLIC'
        },
        update: {},
        create: {
            channel_id: 'PUBLIC',
            name: 'Public',
            type: ChannelType.Public
        }
    });

    const systemUser = await prisma.user.upsert({
        where: {
            user_id: 'ADMIN'
        },
        update: {},
        create: {
            user_id: 'ADMIN',
            email: 'admin',
            password: '$2b$10$96mpoqKrG5rRdLKm16p9U.g9TQZNXjuLOXqRIZ4eVNwLC/tk.ajCe', // admin
            profile: {
                create: {
                    username: 'admin',
                    avatar_url: ''
                }
            },
            account: {
                create: {
                    first_name: 'Admin',
                    last_name: 'Admin'
                }
            },
            channels: {
                create: [ { channel_id: 'PUBLIC', type: MemberType.Owner } ]
            }
        }
    });

    const demoUser = await prisma.user.upsert({
        where: {
            user_id: 'DEMO'
        },
        update: {},
        create: {
            user_id: 'DEMO',
            email: 'demo',
            password: '$2b$10$BCGXlbIMN7mg0jXZ4lFpV.JQ5AqNSROSjqvhDN.ZQVf0P.ku20Lem', // demo
            profile: {
                create: {
                    username: 'demo',
                    avatar_url: ''
                }
            },
            account: {
                create: {
                    first_name: 'demo',
                    last_name: 'demo'
                }
            },
            channels: {
                create: [ { channel_id: 'PUBLIC', type: MemberType.Regular } ]
            }
        }
    });

    const demoCollaboration = await prisma.collaboration.upsert({
        where: {
            collaboration_id: 'DEMO_COLLABORATION'
        },
        update: {},
        create: {
            collaboration_id: 'DEMO_COLLABORATION',
            drawing_id: 'DEMO_DRAWING',
            collaboration_members: {
                create: [ { user_id: 'DEMO', type: 'Owner' } ]
            },
            drawing: {
                create: {
                    drawing_id: 'DEMO_DRAWING'
                }
            }
        }
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
