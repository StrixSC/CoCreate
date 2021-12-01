import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/providers/collaborator.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/src/provider.dart';

class Profile extends StatefulWidget {
  final User _user;

  Profile(this._user);

  @override
  _ProfileScreenState createState() => _ProfileScreenState(_user);
}

class _ProfileScreenState extends State<Profile> {
  List<String> entries = <String>['A', 'B', 'C'];
  List colorCodes = [kContentColor2, Colors.black, kContentColor3];
  List<double> height = <double>[250.0, 2.0, 400.0];
  late List children;
  bool isAuthor = false;
  User _user;

  _ProfileScreenState(this._user);

  @override
  void initState() {
    super.initState();
    isAuthor = context.read<Collaborator>().auth!.user!.uid == _user.uid;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: const Key('Profile'),
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
          backgroundColor: kPrimaryColor,
          centerTitle: true,
          automaticallyImplyLeading: false,
          actions: <Widget>[
            IconButton(
                icon: const Icon(Icons.list_alt, color: Colors.white, size: 34),
                onPressed: () {
                  openHistoryDialog();
                }),
            const SizedBox(width: 20),
            IconButton(
                icon: const Icon(Icons.settings, color: Colors.white, size: 34),
                onPressed: () {
                  openSettingsDialog();
                }),
            const SizedBox(width: 20)
          ]),
      body: DefaultTabController(
        length: 2,
        child: NestedScrollView(
          headerSliverBuilder: (context, _) {
            return [
              SliverList(
                delegate: SliverChildListDelegate(
                  [],
                ),
              ),
            ];
          },
          body: Column(
            children: <Widget>[
              Expanded(
                  child: ListView.builder(
                      padding: const EdgeInsets.all(8),
                      itemCount: entries.length,
                      itemBuilder: (BuildContext context, int index) {
                        return Container(
                            height: height[index],
                            color: colorCodes[index],
                            child: Widgets(index));
                      }))
            ],
          ),
        ),
      ),
    );
  }

  Widgets(index) {
    switch (index) {
      case 0:
        return profileRow();
      case 1:
        return divider();
      case 2:
        return postedDrawings();
      default:
        return Row(children: [Container()]);
    }
  }

  profileRow() {
    return Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      const SizedBox(width: 300),
      CircleAvatar(
          radius: 82,
          backgroundColor: kPrimaryColor,
          backgroundImage: NetworkImage(
              context.read<Collaborator>().auth!.user!.photoURL as String)),
      isAuthor
          ? Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              openHistoryDialog(),
              openSettingsDialog(),
            ])
          : const SizedBox.shrink(),
      const SizedBox(width: 50),
    ]);
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

  postedDrawings() {
    return Row(children: [Container()]);
  }

  openSettingsDialog() {
    return ElevatedButton(
        onPressed: () { showDialog(context: context, builder: (BuildContext context) {
          return const AlertDialog(
            title: Text("My Super title"),
            content: Text("Hello World"),
          );
        });},
        child: const Text('Paramètres du compte',
            style: TextStyle(color: Colors.white)),
        style: ButtonStyle(
            backgroundColor:
            MaterialStateProperty.all(kPrimaryColor)));
  }

  openHistoryDialog() {
    return ElevatedButton(
        onPressed: () { showDialog(context: context, builder: (BuildContext context) {
          return const AlertDialog(
            title: Text("My Super title"),
            content: Text("Hello World"),
          );
        });},
        child: const Text('Historique',
            style: TextStyle(color: Colors.white)),
        style: ButtonStyle(
            backgroundColor:
            MaterialStateProperty.all(kPrimaryColor)));
  }
}
