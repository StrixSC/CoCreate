import 'package:Colorimage/models/user.dart';
import 'package:Colorimage/screens/chat/chat.dart';
import 'package:flutter/cupertino.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:retry/retry.dart';

class Socket {
  User user;
  late IO.Socket socket;
  final String url = 'https://' + (dotenv.env['SERVER_URL'] ?? "localhost:3000");

  Socket(this.user);

  createSocket() {
    print("creating socket");
    print(url);
    socket = IO.io(
        url,
        IO.OptionBuilder()
            .setExtraHeaders({'Cookie': user.cookie})
            .disableAutoConnect()
            .setTransports(['websocket']) // for Flutter or Dart VM
            .build());
    onError();

    socket.connect();
    socket.on('connect', (_) {
      print("connected to socket");
    });
  }

  // Change to ERROR codes with server
  onError() {
    socket.on('error', (err) {
      print(err);
    });
    socket.dispose();
  }

  joinChannel(channelId) {
    socket.emit('join-channel', {'channelId': channelId, 'userId': user});
  }

  initializeChatConnections(username, callbackMessage) {

    socket.on('receive-message', (data) {
      var message = ChatMessage(
          text: data['message'],
          username: username,
          message_username: data['username'],
          timestamp: data['timestamp']);
      callbackMessage(message);
    });

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

  sendMessage(message, channelId) {
    print("emit: $message to $channelId");
    socket.emit('send-message', {'message': message, 'channel_id': channelId, 'user_id': user.id});
  }



}