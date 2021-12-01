import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/providers/collaborator.dart';
import 'package:Colorimage/screens/profile/update_profile.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:persistent_bottom_nav_bar/persistent-tab-view.dart';
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
  List<double> height = <double>[250.0, 2.0, 300.0];
  late List children;
  bool isAuthor = false;
  User _user;
  final List<int> numbers = [1, 2, 3, 5, 8, 13, 21, 34, 55];
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
          title: Text('Profile de ' + _user.displayName.toString()),
          automaticallyImplyLeading: false,
          actions: const <Widget>[
            // IconButton(
            //     icon: const Icon(Icons.list_alt, color: Colors.white, size: 34),
            //     onPressed: () {
            //       openHistoryDialog();
            //     }),
            // const SizedBox(width: 20),
            // IconButton(
            //     icon: const Icon(Icons.settings, color: Colors.white, size: 34),
            //     onPressed: () {
            //       openSettingsDialog();
            //     }),
            // const SizedBox(width: 20)
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
                        return index != 1
                            ? Container(
                                height: height[index],
                                color: colorCodes[index],
                                child: Widgets(index))
                            : Widgets(index);
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
      const SizedBox(width: 50),
      isAuthor
          ? Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Text('Courriel: ' + _user.email.toString()),
              Text('Nom: Patel'),
              Text('Prenom: Pritam'),
            ])
          : const SizedBox.shrink(),
      Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        CircleAvatar(
          backgroundColor: Colors.white,
          radius: 85.0,
          child: CircleAvatar(
            backgroundImage: NetworkImage(_user.photoURL as String),
            radius: 80.0,
          ),
        ),
        const SizedBox(height: 10),
        Text(_user.displayName.toString())
      ]),
      isAuthor
          ? Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              openHistoryDialog(),
              openSettingsDialog(),
              openStatisticsDialog(),
            ])
          : const SizedBox.shrink(),
      const SizedBox(width: 50),
    ]);
  }

  divider() {
    return const Divider(
      color: Colors.black,
      height: 3,
      thickness: 1,
    );
  }

  postedDrawings() {
    return Container(
        padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 10.0),
        height: MediaQuery.of(context).size.height * 0.15,
        child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: numbers.length,
            itemBuilder: (context, index) {
              return Container(
                width: MediaQuery.of(context).size.width * 0.25,
                child: Card(
                  color: kContentColor,
                  child: Container(
                    child: Center(
                        child: Text(
                      numbers[index].toString(),
                      style: TextStyle(color: Colors.white, fontSize: 36.0),
                    )),
                  ),
                ),
              );
            }));
  }

  openSettingsDialog() {
    return ElevatedButton(
        onPressed: () {
          pushNewScreen(
            context,
            screen: UpdateProfile(_user),
            withNavBar: false,
            pageTransitionAnimation: PageTransitionAnimation.cupertino,
          );
        },
        child: const Text('Paramètres de compte',
            style: TextStyle(color: Colors.white)),
        style: ButtonStyle(
            backgroundColor: MaterialStateProperty.all(kPrimaryColor)));
  }

  openHistoryDialog() {
    return ElevatedButton(
        onPressed: () {
          pushNewScreen(
            context,
            screen: UpdateProfile(_user),
            withNavBar: false,
            pageTransitionAnimation: PageTransitionAnimation.cupertino,
          );
        },
        child: const Text('Historique', style: TextStyle(color: Colors.white)),
        style: ButtonStyle(
            backgroundColor: MaterialStateProperty.all(kPrimaryColor)));
  }

  openStatisticsDialog() {
    return ElevatedButton(
        onPressed: () {
          pushNewScreen(
            context,
            screen: UpdateProfile(_user),
            withNavBar: false,
            pageTransitionAnimation: PageTransitionAnimation.cupertino,
          );
        },
        child:
            const Text('Statistiques', style: TextStyle(color: Colors.white)),
        style: ButtonStyle(
            backgroundColor: MaterialStateProperty.all(kPrimaryColor)));
  }
}
