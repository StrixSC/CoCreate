import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/user.dart';
import 'package:Colorimage/providers/messenger.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:persistent_bottom_nav_bar/persistent-tab-view.dart';
import 'package:provider/src/provider.dart';
import '../../app.dart';
import '../../widgets/sidebar.dart';

PersistentTabController _controller =
    new PersistentTabController(initialIndex: 0);

class Kickout extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const height = 30.0;
    return Container(
      color: kContentColor,
        width: 600,
        height: 800,
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [Text('😵', style: TextStyle(fontSize: 120.0))],
              ),
              const SizedBox(height: height),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [Text("Oups!")],
              ),
              const SizedBox(height: height),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                      "(E4555) - Vous avez été désauthentifié, car ce compte")
                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                      "est connecté sur un client en parallèle")
                ],
              ),
              const SizedBox(height: height),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton(
                      onPressed: () {
                        Navigator.pushReplacementNamed(
                            context, loginRoute);
                      },
                      child: Text("Se connecter sous un autre compte"))
                ],
              ),
              const SizedBox(height: height),
            ]));
  }
}
