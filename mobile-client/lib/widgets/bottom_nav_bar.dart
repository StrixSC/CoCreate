import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:persistent_bottom_nav_bar/persistent-tab-view.dart';
import '../screens/chat/chat.dart';
import '../screens/chat/channel.dart';

class BottomNavBar extends StatelessWidget {
  final PersistentTabController _controller;
  final String _username;
  BottomNavBar(this._controller, this._username);

  @override
  Widget build(BuildContext context) {
    return PersistentTabView(
          context,
          navBarHeight: 75,
          controller: this._controller,
          screens: _buildScreens(context, this._username),
          items: _navBarsItems(),
          confineInSafeArea: true,
          backgroundColor: Colors.white, // Default is Colors.white.
          handleAndroidBackButtonPress: true, // Default is true.
          resizeToAvoidBottomInset: true, // This needs to be true if you want to move up the screen when keyboard appears. Default is true.
          stateManagement: true, // Default is true.
          hideNavigationBarWhenKeyboardShows: true, // Recommended to set 'resizeToAvoidBottomInset' as true while using this argument. Default is true.
          decoration: NavBarDecoration(
            borderRadius: BorderRadius.circular(10.0),
            colorBehindNavBar: Colors.white,
          ),
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
          navBarStyle: NavBarStyle.style3, // Choose the nav bar style with this property.
        );
  }
}

List<Widget> _buildScreens(context, username) {
  return [
    Container(),
    Container(),
    Container(),
    Container(),
    Container(),
    // add screens here
  ];
}


List<PersistentBottomNavBarItem> _navBarsItems() {
  return [
    PersistentBottomNavBarItem(
      icon: Icon(CupertinoIcons.home),
      iconSize: 35,
      title: 'Accueil',
      activeColorPrimary: CupertinoColors.activeBlue,
      inactiveColorPrimary: CupertinoColors.systemGrey,
    ),
    PersistentBottomNavBarItem(
      icon: Icon(CupertinoIcons.bubble_left_bubble_right_fill),
      iconSize: 35,
      title: 'Clavardage',
      activeColorPrimary: CupertinoColors.activeBlue,
      inactiveColorPrimary: CupertinoColors.systemGrey,
    ),
    PersistentBottomNavBarItem(
      icon: Icon(CupertinoIcons.plus),
      iconSize: 35,
      title: 'Gallerie',
      activeColorPrimary: CupertinoColors.activeBlue,
      inactiveColorPrimary: CupertinoColors.systemGrey,
    ),
    PersistentBottomNavBarItem(
      icon: Icon(Icons.people),
      iconSize: 35,
      title: 'Équipes',
      activeColorPrimary: CupertinoColors.activeBlue,
      inactiveColorPrimary: CupertinoColors.systemGrey,
    ),
    PersistentBottomNavBarItem(
      icon: Icon(CupertinoIcons.profile_circled),
      iconSize: 35,
      title: 'Profiles',
      activeColorPrimary: CupertinoColors.activeBlue,
      inactiveColorPrimary: CupertinoColors.systemGrey,
    ),
  ];
}
