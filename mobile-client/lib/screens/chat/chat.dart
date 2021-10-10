import 'package:flutter/material.dart';
import 'package:persistent_bottom_nav_bar/persistent-tab-view.dart';

class ChatScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.blue,
      child: ElevatedButton(onPressed: () { pushNewScreenWithRouteSettings(context, screen: TextScreen(), settings: RouteSettings(name:'test')); }, child: Text('Next Page'),

      )
    );
  }
}

class TextScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
        color: Colors.red,
        child: ElevatedButton(onPressed: () { Navigator.of(context).pop(); }, child: Text('Previous Page'),

        )
    );

  }
}