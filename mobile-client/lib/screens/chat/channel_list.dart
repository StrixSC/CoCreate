import 'package:Colorimage/constants/general.dart';
import 'package:flutter/material.dart';
import '../../models/chat.dart';
import 'chat.dart';
import 'chat_card.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:adaptive_dialog/adaptive_dialog.dart';
import 'package:select_dialog/select_dialog.dart';

class ChannelListView extends StatefulWidget {
  final String username;
  ChannelListView(this.username);
  @override
  _ChannelListViewState createState() => _ChannelListViewState(username: this.username);
}

class _ChannelListViewState extends State<ChannelListView> {
  var username;
  bool isChannelSelected = false;
  List<Chat> channels = chatsData;

  _ChannelListViewState({
    this.username,
  });

  callback() {
    setState(() {
      isChannelSelected = false;
    });
  }

  Widget channelListWidget() {
    return (Column(children: [
      Padding(padding: const EdgeInsets.fromLTRB(0, 60, 0, 0), child:
        Title(
            color: Colors.black,
            child: const Text('Canaux de Discussions', style: TextStyle()),
      )),
      const Divider(thickness: 2, color: Colors.black),
      Padding(padding: const EdgeInsets.fromLTRB(0, 0, 0, 0), child:ChatCard(
          chat: Chat(name: "Canal Publique", image: "", time: "3m ago", isActive: false,),
          press: () { setState(() {isChannelSelected = true;}); })),
      const Divider(thickness: 2, color: Colors.black),
      MediaQuery.removePadding(context:context, removeTop: true, child:
        ConstrainedBox(constraints: const BoxConstraints(minHeight: 45.0, maxHeight: 475.0),
        child:ListView.builder(
          shrinkWrap: true,
          itemCount: channels.length,
          itemBuilder: (context, index) => ChatCard(
              chat: channels[index],
              press: () { setState(() {isChannelSelected = true;}); }
          ),
        )
      )),
      const Divider(thickness: 2, color: Colors.black),
      Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          ElevatedButton(onPressed: () { joinChannelDialog(); }, child: const Text('Joindre un canal', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w500),)),
          const Padding(padding: EdgeInsets.fromLTRB(0, 0, 20, 0)),
          ElevatedButton(onPressed: () { createChannelDialog();  }, child: const Text('Créer un canal', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w500),))
        ]
      ),
    ]));
  }

  createChannelDialog() async {
    final text = await showTextInputDialog(
      okLabel: "Créer",
      message:"Veuillez choisir un nom de canal unique.",
      context: context,
      textFields: const [
        DialogTextField(),
      ],
      title: 'Créer un canal',
    );
    setState(() {channels.add(Chat(name: text!.first, image: "", time: "", isActive: false,));}); // Add check for channel already existing
  }

  joinChannelDialog() async {
    Chat ex1 = Chat();
    SelectDialog.showModal<Chat>(
      context,
      searchHint: 'Cherchez un canal par son nom',
      label: "Liste des canaux disponibles",
      selectedValue: ex1,
      items: channels,
      itemBuilder: (BuildContext context, Chat item, bool isSelected) {
        return Padding(
          padding: const EdgeInsets.symmetric(
              horizontal: kDefaultPadding, vertical: kDefaultPadding * 0.75),
          child: Row(
            children: [
              Stack(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundImage: AssetImage(item.image),
                  ),
                ],
              ),
              Expanded(
                child: Padding(
                  padding:
                  const EdgeInsets.symmetric(horizontal: kDefaultPadding),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.name,
                        style:
                        const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
      onChange: (selected) {
        setState(() {
          ex1 = selected;
          channels.add(selected);
        });
      },
    );
  }

  Widget channelChatWidget() {
      // Initialize socket connection with server
      IO.Socket socket = IO.io(
          // 'http://colorimage-109-3900.herokuapp.com/',
          'http://localhost:3000',
          IO.OptionBuilder()
              .setExtraHeaders({'Cookie': 'connect.sid=s%3AqWwIIJbxKIx6WtufUOJknXHlsE6UxUwn.ICblW%2FBsjBpzsSsRW7YMN6PFUkMxBohe%2BoTT3hQwwns; Path=/; Domain=localhost; HttpOnly; Expires=Mon, 25 Oct 2021 18:40:54 GMT;'})
              .disableAutoConnect()
              .setTransports(['websocket']) // for Flutter or Dart VM
              .build());

      socket.io.options['extraHeaders'] = {'Cookie': 'connect.sid=s%3AqWwIIJbxKIx6WtufUOJknXHlsE6UxUwn.ICblW%2FBsjBpzsSsRW7YMN6PFUkMxBohe%2BoTT3hQwwns; Path=/; Domain=localhost; HttpOnly; Expires=Mon, 25 Oct 2021 18:40:54 GMT;'};
      socket.on('error', (err) {
        print(err);
        socket.dispose();
      });

      socket.connect();

      socket.on('connect', (_) {
        print("connection successful");
        socket.emit('join-channel', {'channelId': "30a27c9c-4426-48b0-a08d-2a8c1aa143cb", 'userId': ""});
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