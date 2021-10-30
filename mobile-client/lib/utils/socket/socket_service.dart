import 'package:Colorimage/models/user.dart';
import 'package:Colorimage/screens/chat/chat.dart';
import 'package:flutter/cupertino.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_dotenv/flutter_dotenv.dart';


class Socket {
  User user;
  IO.Socket socket;
  final String url = 'https://' + (dotenv.env['SERVER_URL'] ?? "localhost:3000");

  Socket(this.user, this.socket);

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
}