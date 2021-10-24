import { IUser } from '../models/IUser.model';
import { Server } from 'socket.io';
import { IChannel } from '../models/IChannel.model';

export const getSocketUsers = (io: Server) => {
    const users: IUser[] = [];
    for (const [id, socket] of io.of('/').sockets) {
        users.push({
            user_id: id,
            username: socket.data.username
        } as IUser);
    }

    return users;
};

export const getUsers = (): IUser[] => {
    const arr = [];
    const keys = Object.keys(users);
    for (let i = 0; i < keys.length; i++) {
        arr.push(users[keys[i]]);
    }
    return arr;
};

export const channels: IChannel[] = [{ name: 'Public', id: '1' }];
export const users: { [key: string]: IUser } = {};
