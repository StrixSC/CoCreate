import 'package:Colorimage/models/user.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:persistent_bottom_nav_bar/persistent-tab-view.dart';
import '../../widgets/sidebar.dart';
import '../../widgets/bottom_nav_bar.dart';

PersistentTabController _controller =
    new PersistentTabController(initialIndex: 0);

class Home extends StatelessWidget {
  Home(this._user);

  final User _user;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        drawer: SizedBox(
            width: MediaQuery.of(context).size.width * 0.70,
            child: Sidebar(_controller, _user)),
        body: BottomNavBar(_controller, _user));
  }
}
