import { MemberType } from '.prisma/client';
import log from './logger';
export const retrieveOwnerFromChannels = (channels: any[]): string => {
    const owner = '';
    log('DEBUG', JSON.stringify(channels));

    return owner;
};
