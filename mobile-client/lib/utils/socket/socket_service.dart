
import 'package:firebase_auth/firebase_auth.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_dotenv/flutter_dotenv.dart';


class SocketService {
  User user;
  IO.Socket socket;
  final String url = 'https://' + (dotenv.env['SERVER_URL'] ?? "localhost:5000");

  SocketService(this.user, this.socket) {
    onError();
    socket.connect();
    // onConnect();
    socket.on('disconnect', (_) => print('disconnect'));
  }

  // Change to ERROR codes with server
  onError() {
    socket.on('error', (err) {
      print('Socket error: ');
      print(err.toString());
    });
    socket.on('exception', (err) {
      print('exception');
      print(err);
    });
    socket.on('collaboration:exception', (err) {
      print('gallerie:exception');
      print(err);
    });
    socket.on('channel:exception', (err) {
      print('channel:exception');
      print(err);
    });
    socket.on('channel:exception', (err) {
      print('teams:exception');
      print(err);
    });
  }

  // onConnect() {
  //   socket.on('connect', (_) {
  //     print("connected to socket");
  //   });
  // }
}