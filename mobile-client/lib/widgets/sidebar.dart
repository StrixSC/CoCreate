import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:persistent_bottom_nav_bar/persistent-tab-view.dart';
import '../screens/chat/channel.dart';

class Sidebar extends StatelessWidget {
  final PersistentTabController _controller;
  final String _username;
  Sidebar(this._controller, this._username);

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Column(
        children: [
          // const DrawerHeader(
          //   decoration: BoxDecoration(
          //     color: Colors.blue,
          //   ),
          //   child: Text('Colorimage'),
          // ),
          // ListTile(
          //   title: const Text('Groups'),
          //   onTap: () {
          //     this._controller.index = 3;
          //     Navigator.pop(context);
          //   },
          // ),
          Expanded(
            child: ChannelScreen(_username)
          )
        ],
      ));
  }
}



