import 'package:Colorimage/models/user.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class Socket {
  User user;
  late IO.Socket socket;
  final String? url = dotenv.env['SERVER_URL'] ?? "localhost:3000";

  Socket(this.user);

  createSocket() {
    IO.Socket socket = IO.io(
        url,
        IO.OptionBuilder()
            .disableAutoConnect()
            .setTransports(['websocket']) // for Flutter or Dart VM
            .build());
    socket.auth = {'username': user.username};
    onError();
    socket.connect();
    onConnect();
  }

  // Change to ERROR codes with server
  onError() {
    socket.on('error', (err) {
      if (err['message'] == "Vous devez fournir un nom d'utilisateur!") {
        print("error socket #1");
      }
      else if (err['message'] == "Ce nom d'utilisateur est déjà utilisé, choisissez-en en autre!") {
        print("error socket #2");
    }
      socket.dispose();
    });
  }

  onConnect() {
    socket.on('connect', (_) {
      socket.emit('join-channel', {'username': user.username});
    });
  }

}