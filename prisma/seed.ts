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

    const demoCollaboration = await prisma.collaboration.upsert({
        where: {
            collaboration_id: 'DEMO_COLLABORATION'
        },
        update: {},
        create: {
            collaboration_id: 'DEMO_COLLABORATION',
            drawing_id: 'DEMO_DRAWING',
            collaboration_members: {
                create: [{ user_id: 'DEMO', type: 'Owner' }]
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
