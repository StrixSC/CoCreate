import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/providers/messenger.dart';
import 'package:Colorimage/models/user.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:persistent_bottom_nav_bar/persistent-tab-view.dart';
import 'package:provider/provider.dart';
import '../screens/chat/channel.dart';

class Sidebar extends StatelessWidget {
  Sidebar();

  @override
  Widget build(BuildContext context) {
    return Drawer(key: const PageStorageKey('1'),
            child: Container(color: kContentColor2, child: Column(
              children: const [
                Expanded(
                  child: Channel(),
          )
        ],
      ))
    );}
}



