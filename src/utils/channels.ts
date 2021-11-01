import { MemberType } from '.prisma/client';
export const retrieveOwnerFromChannels = (channels: any[]): string => {
    let owner = '';
    channels.forEach((c: any) => {
        c.channel.members.forEach((m: any) => {
            if (m.type === MemberType.Owner) {
                owner = m.member.profile?.username || '';
            }
        });
    });

    return owner;
};
