import 'dart:convert';
import 'package:Colorimage/components/alert.dart';
import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/messenger.dart';
import 'package:Colorimage/utils/rest/channels_api.dart';
import 'package:Colorimage/utils/rest/users_api.dart';
import 'package:Colorimage/utils/socket/socket_service.dart';
import 'package:flutter/material.dart';
import 'package:provider/src/provider.dart';
import '../../models/chat.dart';
import 'chat.dart';
import 'chat_card.dart';
import 'package:adaptive_dialog/adaptive_dialog.dart';
import 'package:select_dialog/select_dialog.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;


class Channel extends StatefulWidget {
  const Channel({Key? key}) : super(key: key);

  @override
  _ChannelState createState() => _ChannelState();
}

class _ChannelState extends State<Channel> {


  Widget channelListWidget() {
    return (Column(children: [
      Padding(padding: const EdgeInsets.fromLTRB(0, 60, 0, 0), child:
      Title(
        color: Colors.black,
        child: const Text('Canaux de Discussions', style: TextStyle()),
      )),
      const Divider(thickness: 2, color: Colors.black),
      Padding(padding: const EdgeInsets.fromLTRB(0, 0, 0, 0), child: ChatCard( user: context.read<Messenger>().user,
          chat: Chat(name: "Canal Publique", id: '123',  type: 'Public', is_owner: false,),
          press: () { context.read<Messenger>().toggleSelection();})),
      const Divider(thickness: 2, color: Colors.black),
      MediaQuery.removePadding(context: context, removeTop: true, child:
      ConstrainedBox(constraints: context.read<Messenger>().userChannels.isEmpty ? const BoxConstraints(minHeight: 5.0, maxHeight: 75.0) : const BoxConstraints(minHeight: 45.0, maxHeight: 475.0),
          child:
          context.read<Messenger>().userChannels.isEmpty ?  const Center(child: Text("Joignez un canal pour discuter avec vos amis! 😄", style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),)) :
          ListView.builder(
            shrinkWrap: true,
            itemCount: context.read<Messenger>().userChannels.length,
            itemBuilder: (context, index) =>
                ChatCard(
                    chat: context.read<Messenger>().userChannels[index],
                    user: context.read<Messenger>().user,
                    press: () { context.read<Messenger>().toggleSelection(); }
                ),
          )
      )),
      const Divider(thickness: 2, color: Colors.black),
      Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            ElevatedButton(onPressed: () { joinChannelDialog(); }, child: const Text('Joindre un canal', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w500), )),
            const Padding(padding: EdgeInsets.fromLTRB(0, 0, 20, 0)),
            ElevatedButton(onPressed: () { createChannelDialog();  }, child: const Text('Créer un canal', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w500),))
          ]
      ),
    ]));
  }

  createChannelDialog() async {
    final text = await showTextInputDialog(
      okLabel: "Créer",
      message: "Veuillez choisir un nom de canal unique.",
      context: context,
      textFields: [
        DialogTextField(validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Veuillez entrez un nom valide';
          }
        }),
      ],
      title: 'Créer un canal',
    );
    if (text != null) {
      ChannelAPI channels_api = ChannelAPI(context.read<Messenger>().user);
      Map data = {'name': text};
      var body = json.encode(data);
      var response = await channels_api.createChannel(body);
      print('response:' + response.body);
      var jsonResponse = json.decode(response.body) as Map<String, dynamic>;
      print('create: ' + jsonResponse["message"]);
      showSnackBarAsBottomSheet(context, 'Channel was successfully reated :)');
      context.read<Messenger>().userChannels.add(
          Chat(name: text.first, id: "", type: "Public", is_owner: true,));
    }
  }

  joinChannelDialog() async {
    dynamic ex1;
    SelectDialog.showModal<Chat>(
      context,
      searchHint: 'Cherchez un canal par son nom',
      label: "Liste des canaux disponibles",
      selectedValue: ex1,
      items: context.read<Messenger>().allChannels,
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
                    backgroundImage: AssetImage(item.name),
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
          ex1 = selected;
          context.read<Messenger>().userChannels.add(selected);
      },
    );
  }


  Widget channelChatWidget() {
    // temp socket
    IO.Socket socket = IO.io(
        'url',
        IO.OptionBuilder()
            .setExtraHeaders({'Cookie': context.read<Messenger>().user.cookie})
            .disableAutoConnect()
            .setTransports(['websocket']) // for Flutter or Dart VM
            .build());
    Socket sock = Socket(context.read<Messenger>().user, socket);
    sock.createSocket();
    return ChatScreen(context.read<Messenger>().user, sock);
  }

  @override
  Widget build(BuildContext context) {
    final messenger = context.watch<Messenger>();
    return Column(
      key: const PageStorageKey("my_key"),
      children: [
        Expanded(
            child: messenger.isChannelSelected ? channelChatWidget() : channelListWidget()
        ),
      ],
    );
  }
}