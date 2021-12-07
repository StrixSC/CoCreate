import 'package:Colorimage/models/user.dart';
import 'package:Colorimage/providers/messenger.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:persistent_bottom_nav_bar/persistent-tab-view.dart';
import 'package:provider/src/provider.dart';
import '../../widgets/sidebar.dart';
import '../../widgets/bottom_nav_bar.dart';

PersistentTabController _controller =
new PersistentTabController(initialIndex: 0);

class Home extends StatefulWidget {
  const Home({Key? key}) : super(key: key);

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<Home> {

  @override
  Widget build(BuildContext context) {
    return BottomNavBar(_controller);
  }

}
