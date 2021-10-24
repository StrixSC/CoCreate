import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:persistent_bottom_nav_bar/persistent-tab-view.dart';
import '../../widgets/sidebar.dart';
import '../../widgets/bottom_nav_bar.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

PersistentTabController _controller = new PersistentTabController(initialIndex: 0);

class Home extends StatelessWidget {
  Home(this._username);
  final String _username;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        drawer: SizedBox(width:MediaQuery.of(context).size.width * 0.70, child: Sidebar(_controller, _username)) ,
        body: BottomNavBar(_controller, _username));
  }
}
