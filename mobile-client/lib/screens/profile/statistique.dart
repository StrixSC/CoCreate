import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/providers/collaborator.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:persistent_bottom_nav_bar/persistent-tab-view.dart';
import 'package:provider/src/provider.dart';

class StatistiqueProfile extends StatefulWidget {
  final User _user;

  StatistiqueProfile(this._user);

  @override
  _StatistiqueProfileScreenState createState() =>
      _StatistiqueProfileScreenState(_user);
}

class _StatistiqueProfileScreenState extends State<StatistiqueProfile> {
  late List children;
  bool isAuthor = false;
  User _user;
  TextEditingController userController = TextEditingController();
  TextEditingController passController = TextEditingController();
  final List<int> numbers = [0, 1, 2, 1, 0, 1];
  _StatistiqueProfileScreenState(this._user);

  @override
  void initState() {
    super.initState();
    isAuthor = context.read<Collaborator>().auth!.user!.uid == _user.uid;
    userController.text = _user.displayName.toString();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: const Key('Statistique'),
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
        shadowColor: Colors.white,
        elevation: 1,
        backgroundColor: kContentColor,
        centerTitle: true,
        leadingWidth: 175,
        leading: TextButton(
          onPressed: () {
            Navigator.pop(context);
          },
          child: const Text('Annuler', style: TextStyle(color: Colors.white)),
        ),
        title: Text('Statistiques'),
        automaticallyImplyLeading: false,
      ),
      body: Container(
          width: MediaQuery.of(context).size.width,
          height: MediaQuery.of(context).size.height - 80,
          color: kContentColor,
          child: Column(
            children: <Widget>[
              Expanded(
                  child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 60.0, vertical: 20.0),
                      height: MediaQuery.of(context).size.height,
                      child: SingleChildScrollView(
                          child: ListView.builder(
                              scrollDirection: Axis.vertical,
                              shrinkWrap: true,
                              itemCount: numbers.length,
                              itemBuilder: (context, index) {
                                return Container(
                                  padding: EdgeInsets.only(bottom: 10.0),
                                  width: MediaQuery.of(context).size.width,
                                  child: Card(
                                      color: kContentColor2,
                                      child: statistique(
                                          'Connexion', '2021-12-01')),
                                );
                              }))))
            ],
          )),
    );
  }

  statistique(type, data) {
    return Container(
        decoration: BoxDecoration(border: Border.all(width: 0.25,color: Colors.white)),
        child: Row(children: [
          Column(children: [
            Container(
              padding: EdgeInsets.only(left: 20.0),
              height: 85,
              child: Center(child: richTextWhitePurple('${type}: ', data)),
            )
          ]),
        ]));
  }

  divider() {
    return const Divider(
      color: Colors.black,
      height: 5,
      thickness: 2,
      indent: 140,
      endIndent: 140,
    );
  }

  richTextWhitePurple(String text1, String text2) {
    return Padding(
        padding: EdgeInsets.only(left: 15.0),
        child: RichText(
          text: TextSpan(
            // Note: Styles for TextSpans must be explicitly defined.
            // Child text spans will inherit styles from parent
            style: const TextStyle(fontSize: 32.0),
            children: <TextSpan>[
              TextSpan(text: text1),
              TextSpan(text: text2, style: TextStyle(color: kPrimaryColor)),
            ],
          ),
        ));
  }
}
