import 'package:socket_io_client/socket_io_client.dart' as IO;

class Socket {
  String username;
  IO.Socket socket = IO.io(
      'https://colorimage-109-3900.herokuapp.com/',
      IO.OptionBuilder()
          .disableAutoConnect()
          .setTransports(['websocket']) // for Flutter or Dart VM
          .build());

  Socket(this.username);

  createSocket() {
    socket.auth = {'username': username};
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
      socket.emit('join-channel', {'username': username});
    });
  }

}