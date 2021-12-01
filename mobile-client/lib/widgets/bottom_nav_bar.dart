import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/providers/collaborator.dart';
import 'package:Colorimage/screens/galerie/galerie.dart';
import 'package:Colorimage/screens/profile/profile.dart';
import 'package:provider/src/provider.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:persistent_bottom_nav_bar/persistent-tab-view.dart';

class BottomNavBar extends StatefulWidget {
  final PersistentTabController _controller;
  BottomNavBar(this._controller);

  @override
  _BottomNavBarScreenState createState() => _BottomNavBarScreenState(_controller);
}

class _BottomNavBarScreenState extends State<BottomNavBar> {
  final PersistentTabController _controller;
  _BottomNavBarScreenState(this._controller);

  @override
  Widget build(BuildContext context) {
    return PersistentTabView(
          context,
          navBarHeight: 75,
          controller: this._controller,
          screens: _buildScreens(),
          items: _navBarsItems(),
          confineInSafeArea: true,
          backgroundColor: kContentColor,
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

  List<Widget> _buildScreens() {
    return [
      Container(),
      Container(),
      Galerie(),
      Container(),
      Profile(context.read<Collaborator>().auth!.user!),
      // add screens here
    ];
  }

  final bottomNavBarItems = [
    {"title": "Accueil"   , "icon": const Icon(CupertinoIcons.home)},
    {"title": "Feed"      , "icon": const Icon(CupertinoIcons.photo_fill_on_rectangle_fill)},
    {"title": "Galerie"   , "icon": const Icon(CupertinoIcons.plus_rectangle_fill_on_rectangle_fill)},
    {"title": "Équipes"   , "icon": const Icon(Icons.people)},
    {"title": "Profile"  , "icon": const Icon(CupertinoIcons.profile_circled)}
  ];

  List<PersistentBottomNavBarItem> _navBarsItems() {
    List<PersistentBottomNavBarItem> listBottomNavBarItems = [];
    for(var item in bottomNavBarItems) {
      listBottomNavBarItems.add(
          PersistentBottomNavBarItem(
            icon: item["icon"] as Icon,
            iconSize: 35,
            title: item["title"] as String,
            activeColorPrimary: kPrimaryColor,
            inactiveColorPrimary: CupertinoColors.systemGrey,
          )
      );
    }
    return listBottomNavBarItems;
  }
}
