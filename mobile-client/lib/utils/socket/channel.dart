import 'package:Colorimage/models/chat.dart';
import 'package:Colorimage/models/user.dart';
import 'package:Colorimage/screens/chat/chat.dart';
import 'package:Colorimage/utils/socket/socket_service.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class ChannelSocket extends SocketService {
  ChannelSocket(User user, IO.Socket socket) : super(user, socket);

  // Emits
  sendMessage(message, channelId) {
    print("Socket Emit: $message to $channelId");
    socket.emit('channel:send', {'message': message, 'channelId': channelId});
  }

  joinChannel(channelId) {
    print('Socket Emit : Join channel');
    socket.emit('channel:join', {'channelId': channelId});
  }

  createChannel(channelName) {
    print('Socket Emit : Create channel');
    print(channelName);
    socket.emit('channel:create', {'channelName': channelName});
  }

  leaveChannel(channelId) {
    print('Socket Emit : Leave channel');
    socket.emit('channel:leave', {'channelId': channelId});
  }

  updateChannel(channelId, channelName) {
    print('Socket Emit : Update channel');
    socket.emit(
        'channel:update', {'channelId': channelId, 'channelName': channelName});
  }

  deleteChannel(channelId) {
    print('Socket Emit : Delete channel');
    socket.emit('channel:delete', {'channelId': channelId});
  }

  // Receives
  sentMessage(callbackMessage) {
    socket.on('channel:sent', (data) {
      print('Received message');
      ChatMessage message = ChatMessage(
          messageId: data['messageId'],
          channelId: data['channelId'],
          text: data['message'],
          username: user.username,
          message_username: data['username'],
          timestamp: data['createdAt']);
      callbackMessage('sent', message);
    });
  }

  joinedChannel(callbackChannel) {
    socket.on('channel:joined', (data) {
      print('Socket On : Joined channel');
      Chat channel = Chat(
          id: data['channelId'],
          name: data['channelName'],
          type: 'Public',
          messages: []);
      callbackChannel('joined', channel);
    });
  }

  createdChannel(callbackChannel) {
    socket.on('channel:created', (data) {
      print('Socket Message : Created channel');
      Chat channel = Chat(
          id: data['channelId'],
          name: data['channelName'],
          ownerUsername: data['ownerUsername'],
          collaboration_id: data['collaborationId'],
          updated_at: data['updatedAt'],
          type: 'Public',
          messages: []);
      callbackChannel('created', channel);
    });
  }

  leftChannel(callbackChannel) {
    socket.on('channel:left', (data) {
      print('Socket Message : Left channel');
      String channelId = data['channelId'];
      callbackChannel('left', channelId);
    });
  }

  // TODO : Be careful with what you receive and update (ex: collaboration_id missing)
  updatedChannel(callbackChannel) {
    socket.on('channel:updated', (data) {
      print('Socket Message : Updated channel');
      Chat channel = Chat(
          id: data['channelId'],
          name: data['channelName'],
          updated_at: data['updatedAt'],
          type: 'Public',
          messages: []);
      callbackChannel('updated', channel);
    });
  }

  deletedChannel(callbackChannel) {
    socket.on('channel:deleted', (data) {
      print('Socket Message : Left channel');
      String channelId = data['channelId'];
      callbackChannel('deleted', channelId);
    });
  }

  initializeChannelSocketEvents(callbackChannel) {
    sentMessage(callbackChannel);

    joinedChannel(callbackChannel);

    createdChannel(callbackChannel);

    leftChannel(callbackChannel);

    updatedChannel(callbackChannel);

    deletedChannel(callbackChannel);

    print("initialized socket events");
  }
}
