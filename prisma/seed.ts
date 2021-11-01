import { ChannelType } from '.prisma/client';
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

    const demoUser = await prisma.user.upsert({
        where: {
            user_id: 'DEMO'
        },
        update: {},
        create: {
            user_id: 'DEMO',
            email: 'demo',
            password: '$2b$10$BCGXlbIMN7mg0jXZ4lFpV.JQ5AqNSROSjqvhDN.ZQVf0P.ku20Lem',
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
