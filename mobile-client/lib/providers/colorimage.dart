
import 'package:Colorimage/providers/team.dart';
import 'package:Colorimage/utils/socket/channel.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'collaborator.dart';
import 'messenger.dart';


// TODO: this will be the god object that contains everything
class Colorimage extends ChangeNotifier {
  UserCredential? auth;
  Messenger messenger;
  Collaborator collaborator;
  Teammate teammate;
  late IO.Socket _socket;

  late Function openDrawer;

  Colorimage(this.auth, this.messenger, this.collaborator, this.teammate);

  void initializeSocket(token) {
    _socket = IO.io(
        'https://' + (dotenv.env['SERVER_URL'] ?? "localhost:5000"),
        IO.OptionBuilder()
            .setExtraHeaders({'Authorization': 'Bearer ' + token})
            .disableAutoConnect()
            .setTransports(['websocket']) // for Flutter or Dart VM
            .build());
    messenger.channelSocket = ChannelSocket(auth!.user as User, _socket);
    messenger.channelSocket = ChannelSocket(auth!.user as User, _socket);
    messenger.channelSocket = ChannelSocket(auth!.user as User, _socket);

    _socket.on('connect', (_) {
      print("Socket events initialized");
      messenger.channelSocket.initializeChannelSocketEvents(messenger.callbackChannel);
      messenger.joinAllUserChannels();
    });

    notifyListeners();
  }
}
