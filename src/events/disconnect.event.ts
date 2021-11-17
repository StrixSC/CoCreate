import { Socket, Server } from 'socket.io';
export = (io: Server, socket: Socket) => {
    socket.on('disconnect', () => {
        socket.rooms.forEach((room) => {
            io.to(room).emit("user:disconnection", {
                userId: socket.data.user
            })
        })
    })
}