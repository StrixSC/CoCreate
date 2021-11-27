import { v4 } from 'uuid';
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
                create: [{ channel_id: 'PUBLIC', type: MemberType.Owner }]
            }
        }
    });


    const publicAvatars = await prisma.avatar.createMany({
        data: [
            { index: 1, avatar_id: 'PUBLIC_1', user_id: "ADMIN", isPublic: true, avatar_url: "https://firebasestorage.googleapis.com/v0/b/colorimage-f380e.appspot.com/o/public%2Fbird.jpg?alt=media&token=4f73cbdd-3cfe-4fe7-a871-51ed9bc3c604" },
            { index: 2, avatar_id: 'PUBLIC_2', user_id: "ADMIN", isPublic: true, avatar_url: "https://firebasestorage.googleapis.com/v0/b/colorimage-f380e.appspot.com/o/public%2Fe4a49a16ff18697f5dd98a9af4015bfd.jpg?alt=media&token=75c8f7b4-3764-4ccb-b9e3-3243eb0dfd48" },
            { index: 3, avatar_id: 'PUBLIC_3', user_id: "ADMIN", isPublic: true, avatar_url: "https://firebasestorage.googleapis.com/v0/b/colorimage-f380e.appspot.com/o/public%2FSeagull.jpg?alt=media&token=b902e745-748e-431e-9b03-66936e829d80" },
        ],
        skipDuplicates: true
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
                create: [{ channel_id: 'PUBLIC', type: MemberType.Regular }]
            },
            collaborations: {
                create: [{ collaboration_id: 'DEMO_COLLABORATION', type: MemberType.Owner }]
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
                    create: [{ channel_id: 'PUBLIC', type: MemberType.Regular }]
                },
                collaborations: {
                    create: [{ collaboration_id: 'DEMO_COLLABORATION', type: MemberType.Regular }]
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
