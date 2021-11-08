import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/user.dart';
import 'package:Colorimage/screens/galerie/galerie.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:persistent_bottom_nav_bar/persistent-tab-view.dart';
import '../screens/chat/chat.dart';
import '../screens/chat/channel.dart';

class BottomNavBar extends StatelessWidget {
  final PersistentTabController _controller;
  BottomNavBar(this._controller);

  @override
  Widget build(BuildContext context) {
    return PersistentTabView(
          context,
          navBarHeight: 75,
          controller: this._controller,
          screens: _buildScreens(context),
          items: _navBarsItems(),
          confineInSafeArea: true,
          backgroundColor: Colors.white,
          popAllScreensOnTapOfSelectedTab: true,
          popActionScreens: PopActionScreensType.all,
          itemAnimationProperties: const ItemAnimationProperties( // Navigation Bar's items animation properties.
            duration: Duration(milliseconds: 200),
            curve: Curves.ease,
          ),
          screenTransitionAnimation: const ScreenTransitionAnimation( // Screen transition animation on change of selected tab.
            animateTabTransition: false,
            curve: Curves.ease,
            duration: Duration(milliseconds: 200),
          ),
          navBarStyle: NavBarStyle.style6, // Choose the nav bar style with this property.
        );
  }
}

List<Widget> _buildScreens(context) {
  return [
    Container(),
    Container(),
    Galerie(),
    Container(),
    Container(),
    // add screens here
  ];
}


final bottomNavBarItems = [
  {"title": "Accueil"   , "icon": const Icon(CupertinoIcons.home)},
  {"title": "Clavardage", "icon": const Icon(CupertinoIcons.bubble_left_bubble_right_fill)},
  {"title": "Galerie"   , "icon": const Icon(CupertinoIcons.plus)},
  {"title": "Équipes"   , "icon": const Icon(Icons.people)},
  {"title": "Profiles"  , "icon": const Icon(CupertinoIcons.profile_circled)}
];

List<PersistentBottomNavBarItem> _navBarsItems() {
  List<PersistentBottomNavBarItem> listBottomNavBarItems = [];
  for(var item in bottomNavBarItems) {
    listBottomNavBarItems.add(
      PersistentBottomNavBarItem(
        icon: item["icon"] as Icon,
        iconSize: 35,
        title: item["title"] as String,
        activeColorPrimary: CupertinoColors.activeBlue,
        inactiveColorPrimary: CupertinoColors.systemGrey,
      )
    );
  }
  return listBottomNavBarItems;
}
