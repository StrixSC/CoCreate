import 'package:Colorimage/models/user.dart';
import 'package:Colorimage/screens/chat/chat.dart';
import 'package:Colorimage/utils/socket/socket_service.dart';
import 'package:flutter/cupertino.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class ChatSocket extends Socket {
  ChatSocket(User user, IO.Socket socket) : super(user, socket);

  // Emits
  sendMessage(message, channelId) {
    print("emit: $message to $channelId");
    socket.emit('send-message', {'message': message, 'channel_id': channelId, 'user_id': user.id});
  }

  // Receives
  receiveMessage(callbackMessage) {
    socket.on('receive-message', (data) {
      print('Received message');
      var message = ChatMessage(
          text: data['message'],
          username: user.username,
          message_username: data['username'],
          timestamp: data['timestamp']);
      callbackMessage(message);
    });
  }

  userConnected(callbackMessage) {
    socket.on('user-connection', (user) {
      print('Someone connected');
      print(user);
      var newConnection = Container(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Center(
              child: Text(user['message'], style: TextStyle(fontSize: 25)),
            )
          ],
        ),
      );
      callbackMessage(newConnection);
    });
  }

  userDisconnected(callbackMessage) {
    socket.on('user-disconnect', (user) {
      print('Someone disconnected');
      print(user);
      var newConnection = Container(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Center(
              child: Text(user['message'], style: TextStyle(fontSize: 25)),
            )
          ],
        ),
      );
      callbackMessage(newConnection);
    });
  }

  initializeChatConnections(username, callbackMessage) {}
}