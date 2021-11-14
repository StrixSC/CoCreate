import { ChannelType, CollaborationType, MemberType } from '.prisma/client';
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

    const demoCollaboration = await prisma.collaboration.upsert({
        where: {
            collaboration_id: 'DEMO_COLLABORATION'
        },
        update: {},
        create: {
            collaboration_id: 'DEMO_COLLABORATION',
            drawing_id: 'DEMO_DRAWING',
            type: CollaborationType.Public,
            drawing: {
                create: {
                    title: 'DEMO_TITLE',
                    drawing_id: 'DEMO_DRAWING'
                }
            }
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
            user_id: 'LnJiMTeEAbd9u3plL2FD5Jaa3PF3'
        },
        update: {},
        create: {
            user_id: 'LnJiMTeEAbd9u3plL2FD5Jaa3PF3',
            email: 'demo@demo.com',
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
            },
            collaborations: {
                create: [ { collaboration_id: 'DEMO_COLLABORATION', type: MemberType.Owner } ]
            }
        }
    });

    if (process.env.NODE_ENV !== 'production') {
        const demoTestUser = await prisma.user.upsert({
            where: {
                user_id: 'DEMO'
            },
            update: {},
            create: {
                user_id: 'DEMO',
                email: 'demo',
                profile: {
                    create: {
                        username: 'demo_user',
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
                },
                collaborations: {
                    create: [ { collaboration_id: 'DEMO_COLLABORATION', type: MemberType.Regular } ]
                }
            }
        });
    }

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
