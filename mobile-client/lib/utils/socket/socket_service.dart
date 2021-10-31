import 'package:Colorimage/models/user.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_dotenv/flutter_dotenv.dart';


class SocketService {
  User user;
  IO.Socket socket;
  final String url = 'https://' + (dotenv.env['SERVER_URL'] ?? "localhost:5000");

  SocketService(this.user, this.socket) {
    print("----------- CONNECTING SOCKET: " + url + "-----------");
    onError();
    socket.connect();
    onConnect();
  }

  // Change to ERROR codes with server
  onError() {
    socket.on('error', (err) {
      print('Socket error: ' + err);
    });
    socket.dispose();
  }

  onConnect() {
    socket.on('connect', (_) {
      print("connected to socket");
    });
  }
}