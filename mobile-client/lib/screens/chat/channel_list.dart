import 'package:flutter/material.dart';
import '../../models/chat.dart';
import 'chat.dart';
import 'chat_card.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class ChannelListView extends StatefulWidget {
  final String username;
  ChannelListView(this.username);
  @override
  _ChannelListViewState createState() => _ChannelListViewState(username: this.username);
}

class _ChannelListViewState extends State<ChannelListView> {
  var username;
  bool isChannelSelected = false;

  _ChannelListViewState({
    this.username,
  });

  callback() {
    setState(() {
      isChannelSelected = false;
    });
  }

  Widget channelListWidget() {
    return (Column(children: [Padding(padding: const EdgeInsets.fromLTRB(0, 60, 0, 0), child:
      Title(
        color: Colors.black,
        child: const Text('Channels', style: TextStyle()),
      )
    ), ListView.builder(
      shrinkWrap: true,
      itemCount: chatsData.length,
      itemBuilder: (context, index) => ChatCard(
          chat: chatsData[index],
          press: () { setState(() {isChannelSelected = true;}); }
      ),
    ) ]));
  }

  Widget channelChatWidget() {
      // Initialize socket connection with server
      IO.Socket socket = IO.io(
          'https://colorimage-109-3900.herokuapp.com/',
          IO.OptionBuilder()
              .disableAutoConnect()
              .setTransports(['websocket']) // for Flutter or Dart VM
              .build());

      socket.auth = {'username': username};

      socket.on('error', (err) {
        print("There was an error with the socket connection");
        socket.dispose();
      });

      socket.connect();

      socket.on('connect', (_) {
        print("connection successful");
        socket.emit('join-channel', {'username': username});
      });

      return ChatScreen(username, socket, callback);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: isChannelSelected ? channelChatWidget() : channelListWidget()
        ),
      ],
    );
  }
}


class Channel {
  String name;
  Channel(this.name);
}