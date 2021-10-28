import 'package:flutter/material.dart';
import 'dart:convert' as convert;
import 'package:http/http.dart' as http;
import './channel_list.dart';
import '../../constants/general.dart';

  class ChannelScreen extends StatefulWidget {
    final String username;
    ChannelScreen(this.username);
    @override
    _ChannelScreenState createState() => _ChannelScreenState(username: this.username);
  }

  class _ChannelScreenState extends State<ChannelScreen> {
    _ChannelScreenState({
      required this.username,
    });

    List<Channel>? channelList = [];
    final String username;

    @override
    initState() {
      super.initState();
      fetchChannels();
    }

    Future<void> fetchChannels() async {
      var url = Uri.https(
          'www.googleapis.com', '/books/v1/volumes', {'q': '{http}'});
      final response = await http.get(url);
      if (response.statusCode == 200) {
        var jsonResponse =
        convert.jsonDecode(response.body) as Map<String, dynamic>;
        var itemCount = jsonResponse['totalItems'];
        print('Number of books about http: $itemCount.');
        // channels.forEach((element) {channelList!.add(element);});
      } else {
        print('Request failed with status: ${response.statusCode}.');
      }
    }

    @override
    Widget build(BuildContext context) {
      return Scaffold(
        // appBar: buildAppBar(),
        body: ChannelListView(username),
      );
    }

    // AppBar buildAppBar() {
    //   return AppBar(
    //     automaticallyImplyLeading: false,
    //     title: Text("Chats"),
    //     actions: [
    //       IconButton(
    //         icon: Icon(Icons.search),
    //         onPressed: () {},
    //       ),
    //     ],
    //   );
    // }

  }
