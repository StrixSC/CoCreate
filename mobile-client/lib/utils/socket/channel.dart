import 'package:Colorimage/models/chat.dart';
import 'package:Colorimage/screens/chat/chat.dart';
import 'package:Colorimage/utils/socket/socket_service.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class ChannelSocket {
  User user;
  IO.Socket socket;

  ChannelSocket({required this.user, required this.socket});

  // Emits
  sendMessage(message, channelId) {
    socket.emit('channel:send', {'message': message, 'channelId': channelId});
  }

  joinChannel(channelId) {
    socket.emit('channel:join', {'channelId': channelId});
  }

  createChannel(channelName) {
    socket.emit('channel:create', {'channelName': channelName});
  }

  leaveChannel(channelId) {
    socket.emit('channel:leave', {'channelId': channelId});
  }

  updateChannel(channelId, channelName) {
    socket.emit(
        'channel:update', {'channelId': channelId, 'channelName': channelName});
  }

  deleteChannel(channelId) {
    socket.emit('channel:delete', {'channelId': channelId});
  }

  // Receives
  userInitialized(callbackMessage) {
    socket.on('user:initialized', (data) {
      print('data');
      print(data);
      // callbackMessage('sent', data);
    });
  }
  // TODO: brin to another page saying already logged in somewhere else
  userInitExeption(callbackMessage) {
    socket.on('user:init:exception', (data) {
      print(data);
      // callbackMessage('sent', data);
    });
  }
  sentMessage(callbackMessage) {
    socket.on('channel:sent', (data) {
      ChatMessage message = ChatMessage(
          messageId: data['messageId'],
          channelId: data['channelId'],
          text: data['message'],
          username: user.displayName as String,
          message_username: data['username'],
          timestamp: data['createdAt']);
      callbackMessage('sent', message);
    });
  }

  joinedChannel(callbackChannel) {
    socket.on('channel:joined', (data) {
      Chat channel = Chat(
        id: data['channelId'] ?? '',
        name: data['channelName'] ?? '',
        type:'',
        messages: [],
        onlineMembers: [],
      );
      callbackChannel('joined', channel);
    });
  }

  createdChannel(callbackChannel) {
    socket.on('channel:created', (data) {
      Chat channel = Chat(
          id: data['channelId'],
          name: data['channelName'],
          ownerUsername: data['ownerUsername'],
          collaborationId: data['collaborationId'],
          updatedAt: data['updatedAt'],
          messages: [],
          onlineMembers: []);
      callbackChannel('created', channel);
    });
  }

  leftChannel(callbackChannel) {
    socket.on('channel:left', (data) {
      // String channelId = data['channelId'];
      String channelId = '';
      callbackChannel('left', channelId);
    });
  }

  updatedChannel(callbackChannel) {
    socket.on('channel:updated', (data) {
      Chat channel = Chat(
        id: data['channelId'],
        name: data['channelName'],
        updatedAt: data['updatedAt'],
        type: data['channel_type'],
        messages: [],
        onlineMembers: data['online_members'],
      );
      callbackChannel('updated', channel);
    });
  }

  deletedChannel(callbackChannel) {
    socket.on('channel:deleted', (data) {
      String channelId = data['channelId'];
      callbackChannel('deleted', channelId);
    });
  }

  initializeChannelSocketEvents(callbackChannel) {

    userInitialized(callbackChannel);

    userInitExeption(callbackChannel);

    sentMessage(callbackChannel);

    joinedChannel(callbackChannel);

    createdChannel(callbackChannel);

    leftChannel(callbackChannel);

    updatedChannel(callbackChannel);

    deletedChannel(callbackChannel);
  }
}
