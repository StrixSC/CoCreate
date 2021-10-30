import 'package:Colorimage/models/chat.dart';
import 'package:Colorimage/models/user.dart';
import 'package:Colorimage/utils/socket/socket_service.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class ChannelSocket extends Socket {
  ChannelSocket(User user, IO.Socket socket) : super(user, socket);

  // Emits
  joinChannel(channelId) {
    print('Socket Emit : Join channel');
    socket.emit('channel:join', {'channelId': channelId});
  }

  createChannel(channelName) {
    print('Socket Emit : Create channel');
    socket.emit('channel:create', {'channelName': channelName});
  }

  leaveChannel(channelId) {
    print('Socket Emit : Create channel');
    socket.emit('channel:leave', {'channelId': channelId});
  }

  updateChannel(channelId, channelName) {
    print('Socket Emit : Update channel');
    socket.emit('channel:leave', {'channelId': channelId, 'channelName': channelName});
  }

  deleteChannel(channelId) {
    print('Socket Emit : Update channel');
    socket.emit('channel:leave', {'channelId': channelId});
  }

  // Receives
  joinedChannel(callbackChannel) {
    socket.on('channel:joined', (data) {
      print('Socket On : Joined channel');
      var channel = Chat(
          id: data['channelId'],
          name: data['channelName'],
          collaboration_id: data['collaborationId'],
          updated_at: data['updatedAt'],
          type: 'Public');
      callbackChannel(channel);
    });
  }

  createdChannel(callbackChannel) {
    socket.on('channel:created', (data) {
      print('Socket Message : Created channel');
      var channel = Chat(
          id: data['channelId'],
          name: data['channelName'],
          collaboration_id: data['collaborationId'],
          updated_at: data['updatedAt'],
          type: 'Public');
      callbackChannel(channel);
    });
  }

  leftChannel(callbackChannel)  {
    socket.on('channel:left', (data) {
      print('Socket Message : Left channel');
      var channel_id = data['channelId'];
      callbackChannel(channel_id);
    });
  }

  // TODO : Be careful with what you receive and update (ex: collaboration_id missing)
  updatedChannel(callbackChannel) {
    socket.on('channel:delete', (data) {
      print('Socket Message : Updated channel');
      var channel = Chat(
          id: data['channelId'],
          name: data['channelName'],
          updated_at: data['updatedAt'],
          type: 'Public');
      callbackChannel(channel);
    });
  }

  deletedChannel(callbackChannel) {
    socket.on('channel:deleted', (data) {
      print('Socket Message : Left channel');
      var channel_id = data['channelId'];
      callbackChannel(channel_id);
    });
  }

}