import 'dart:convert';
import 'package:Colorimage/components/alert.dart';
import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/user.dart';
import 'package:Colorimage/utils/rest/channels_api.dart';
import 'package:Colorimage/utils/rest/users_api.dart';
import 'package:Colorimage/utils/socket_service.dart';
import 'package:flutter/material.dart';
import '../../models/chat.dart';
import 'chat.dart';
import 'chat_card.dart';
import 'package:adaptive_dialog/adaptive_dialog.dart';
import 'package:select_dialog/select_dialog.dart';

class ChannelListView extends StatefulWidget {
  final User user;
  ChannelListView(this.user);
  @override
  _ChannelListViewState createState() => _ChannelListViewState(user: this.user);
}

class _ChannelListViewState extends State<ChannelListView> {
  var user;
  bool isChannelSelected = false;
  List<Chat> userChannels = [];
  List<Chat> allChannels = [];

  _ChannelListViewState({
    this.user,
  });

  @override
  initState() {
    super.initState();
    fetchChannels();
  }

  callback() {
    setState(() {
      isChannelSelected = false;
    });
  }

  fetchChannels() async {
    UsersAPI rest = UsersAPI(user);
    var  response = await rest.fetchUserChannels();
    if (response.statusCode == 200) {
      var jsonResponse = json.decode(response.body) as List<dynamic>;//Map<String, dynamic>;
      print('jsonResponse');
      print(jsonResponse);
      setState(() {      for (var channel in jsonResponse) {
        userChannels.add(Chat(name: channel['name'], id: channel['channel_id'], type: channel['type'],
            is_owner: channel['is_owner']));
      }});
    } else {
      print('Request failed with status: ${response.body}.');
      userChannels = [];
    }
  }

  fetchAllChannels() async {
    allChannels = [];
    ChannelAPI rest = ChannelAPI(user);
    var  response = await rest.fetchChannels();
    if (response.statusCode == 200) {
      var jsonResponse = json.decode(response.body) as List<dynamic>;//Map<String, dynamic>;
      print('jsonResponse');
      print(jsonResponse);
      setState(() {      for (var channel in jsonResponse) {
        allChannels.add(Chat(name: channel['name'], id: channel['channel_id'], type: channel['type'],
           updated_at: channel['updated_at']));
      }});
    } else {
      print('Request failed with status: ${response.body}.');
      allChannels = [];
    }
  }


  Widget channelListWidget() {
    return (Column(children: [
      Padding(padding: const EdgeInsets.fromLTRB(0, 60, 0, 0), child:
        Title(
            color: Colors.black,
            child: const Text('Canaux de Discussions', style: TextStyle()),
      )),
      const Divider(thickness: 2, color: Colors.black),
      Padding(padding: const EdgeInsets.fromLTRB(0, 0, 0, 0), child: ChatCard( user: user,
          chat: Chat(name: "Canal Publique", id: '123',  type: 'Public', is_owner: false,),
          press: () { setState(() {isChannelSelected = true;}); })),
      const Divider(thickness: 2, color: Colors.black),
      MediaQuery.removePadding(context:context, removeTop: true, child:
        ConstrainedBox(constraints: userChannels.isEmpty ? const BoxConstraints(minHeight: 5.0, maxHeight: 75.0) : const BoxConstraints(minHeight: 45.0, maxHeight: 475.0),
        child:
        userChannels.isEmpty ?  const Center(child: Text("Joignez un canal pour discuter avec vos amis! 😄", style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),)) :
        ListView.builder(
          shrinkWrap: true,
          itemCount: userChannels.length,
          itemBuilder: (context, index) =>
              ChatCard(
                chat: userChannels[index],
                user: user,
                press: () { setState(() {isChannelSelected = true;});}
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
      message:"Veuillez choisir un nom de canal unique.",
      context: context,
      textFields: [
        DialogTextField(validator: (value) { if(value == null || value.isEmpty) {return 'Veuillez entrez un nom valide';}}),
      ],
      title: 'Créer un canal',
    );
    if(text != null) {
      ChannelAPI channels_api = ChannelAPI(user);
      Map data = {'name': text};
      var body = json.encode(data);
      var response = await channels_api.createChannel(body);
      print('response:' + response.body);
      var jsonResponse = json.decode(response.body) as Map<String, dynamic>;
      print('create: ' + jsonResponse["message"]);
      showSnackBarAsBottomSheet(context, 'Channel was successfully reated :)');
      setState(() {userChannels.add(Chat(name: text.first, id: "", type: "Public", is_owner: true,));});
    }
  }

  joinChannelDialog() async {
    await fetchAllChannels();
    dynamic ex1;
    SelectDialog.showModal<Chat>(
      context,
      searchHint: 'Cherchez un canal par son nom',
      label: "Liste des canaux disponibles",
      selectedValue: ex1,
      items: allChannels,
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
        setState(() {
          ex1 = selected;
          userChannels.add(selected);
        });
      },
    );
  }

  Widget channelChatWidget() {
      // Initialize socket connection with server
      Socket socket = Socket(user);
      socket.createSocket();
      return ChatScreen(user, socket, callback);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      key: const PageStorageKey("my_key"),
      children: [
        Expanded(
          child: isChannelSelected ? channelChatWidget() : channelListWidget()
        ),
      ],
    );
  }
}