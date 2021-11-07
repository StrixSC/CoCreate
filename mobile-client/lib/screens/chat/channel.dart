import 'package:Colorimage/providers/messenger.dart';
import 'package:flutter/material.dart';
import 'package:provider/src/provider.dart';
import '../../models/chat.dart';
import 'chat.dart';
import 'chat_card.dart';
import 'package:adaptive_dialog/adaptive_dialog.dart';
import 'package:select_dialog/select_dialog.dart';

class Channel extends StatefulWidget {
  const Channel({Key? key}) : super(key: key);

  @override
  _ChannelState createState() => _ChannelState();
}

class _ChannelState extends State<Channel> {
  Widget channelListWidget() {
    return (Column(children: [
      Padding(
          padding: const EdgeInsets.fromLTRB(0, 60, 0, 0),
          child: Title(
            color: Colors.black,
            child: const Text('Canaux de Discussions', style: TextStyle()),
          )),
      const Divider(thickness: 2, color: Colors.black),
      MediaQuery.removePadding(
          context: context,
          removeTop: true,
          child: ConstrainedBox(
              constraints: context.read<Messenger>().userChannels.isEmpty
                  ? const BoxConstraints(minHeight: 5.0, maxHeight: 75.0)
                  : const BoxConstraints(minHeight: 45.0, maxHeight: 475.0),
              child: context.read<Messenger>().userChannels.isEmpty
                  ? const Center(
                      child: Text(
                      "Joignez un canal pour discuter avec vos amis! 😄",
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w500),
                    ))
                  : ListView.builder(
                      shrinkWrap: true,
                      itemCount: context.read<Messenger>().userChannels.length,
                      itemBuilder: (context, index) => ChatCard(
                          chat: context.watch<Messenger>().userChannels[index],
                          user: context.watch<Messenger>().auth!.user!,
                          press: () {
                            context.read<Messenger>().toggleSelection();
                            context
                                .read<Messenger>()
                                .currentSelectedChannelIndex = index;
                            if (context
                                .read<Messenger>()
                                .userChannels[index]
                                .messages
                                .isNotEmpty) {
                              context
                                      .read<Messenger>()
                                      .userChannels[index]
                                      .lastReadMessage =
                                  context
                                      .read<Messenger>()
                                      .userChannels[index]
                                      .messages
                                      .first
                                      .text;
                            }
                          }),
                    ))),
      const Divider(thickness: 2, color: Colors.black),
      Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            ElevatedButton(
                onPressed: () {
                  context.read<Messenger>().getAvailableChannels();
                  joinChannelDialog(context.read<Messenger>().auth!.user);
                },
                child: const Text(
                  'Joindre un canal',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w500),
                )),
            const Padding(padding: EdgeInsets.fromLTRB(0, 0, 20, 0)),
            ElevatedButton(
                onPressed: () {
                  createChannelDialog();
                },
                child: const Text(
                  'Créer un canal',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w500),
                ))
          ]),
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
      context.read<Messenger>().channelSocket.createChannel(text[0]);
      // ChannelAPI channels_api = ChannelAPI(context.read<Messenger>().user);
      // Map data = {'name': text};
      // var body = json.encode(data);
      // var response = await channels_api.createChannel(body);
      // if (response.statusCode == 200) {
      //   print('response:' + response.body);
      //   var jsonResponse = json.decode(response.body) as Map<String, dynamic>;
      //   print('create: ' + jsonResponse["message"]);
      //   showSnackBarAsBottomSheet(context, 'Channel was successfully reated :)');
      //   context.read<Messenger>().socket.createChannel(text);
      // } else {
      //   print('Create request failed with status: ${response.statusCode}.');
      // }
    }
  }

  joinChannelDialog(user) async {
    dynamic ex1;
    SelectDialog.showModal<Chat>(
      context,
      searchHint: 'Cherchez un canal par son nom',
      label: "Liste des canaux disponibles",
      selectedValue: ex1,
      items: context.read<Messenger>().availableChannel,
      itemBuilder: (context, item, selected) => ChatCard(
          chat: item,
          user: user,
          press: () {
            context.watch<Messenger>().channelSocket.joinChannel(item.id);
          }),
      emptyBuilder: (context) => Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Text('Aucun canal disponible..',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w500))
          ]),
      okButtonBuilder: (context, onPressed) {
        return Align(
            alignment: Alignment.centerRight,
            child: ElevatedButton(
              onPressed: () => {},
              child: Icon(Icons.check, color: Colors.black),
            ));
      },
      onChange: (selected) {
        ex1 = selected;
      },
    );
  }

  Widget channelChatWidget() {
    return ChatScreen(context.read<Messenger>().currentSelectedChannelIndex);
  }

  @override
  Widget build(BuildContext context) {
    Messenger messenger = context.watch<Messenger>();
    return Column(
      key: const PageStorageKey("channels"),
      children: [
        Expanded(
            child: messenger.isChannelSelected
                ? channelChatWidget()
                : channelListWidget()),
      ],
    );
  }
}
