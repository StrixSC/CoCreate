import 'package:Colorimage/models/messenger.dart';
import 'package:Colorimage/models/user.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:persistent_bottom_nav_bar/persistent-tab-view.dart';
import 'package:provider/provider.dart';
import '../screens/chat/channel.dart';

class Sidebar extends StatelessWidget {
  final PersistentTabController _controller;
  final User _user;
  Sidebar(this._controller, this._user);

  @override
  Widget build(BuildContext context) {
    return Drawer(key: PageStorageKey(_user.id),
            child: Column(
              children: const [
                Expanded(
                  child: Channel(),
          )
        ],
      )
    );}
}



