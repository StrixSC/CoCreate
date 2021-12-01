import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/providers/collaborator.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:persistent_bottom_nav_bar/persistent-tab-view.dart';
import 'package:provider/src/provider.dart';

class UpdateProfile extends StatefulWidget {
  final User _user;

  UpdateProfile(this._user);

  @override
  _UpdateProfileScreenState createState() => _UpdateProfileScreenState(_user);
}

class _UpdateProfileScreenState extends State<UpdateProfile> {
  late List children;
  bool isAuthor = false;
  User _user;
  TextEditingController userController = TextEditingController();
  TextEditingController passController = TextEditingController();

  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  static const _fontSize = 20.0;
  static const padding = 30.0;
  bool _passwordVisible = false;

  _UpdateProfileScreenState(this._user);

  @override
  void initState() {
    super.initState();
    _passwordVisible = false;
    isAuthor = context.read<Collaborator>().auth!.user!.uid == _user.uid;
    userController.text = _user.displayName.toString();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: const Key('Paramètre de compte'),
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
          title: Text('Paramètre de compte'),
          automaticallyImplyLeading: false,
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('Confirmer'),
            ),
          ]),
      body: Column(
        children: <Widget>[
          Form(
              key: _formKey,
              child: Flexible(
                  child: ListView(
                      shrinkWrap: true,
                      padding: const EdgeInsets.only(left: 0.0, right: 0.0),
                      children: <Widget>[
                        Container(
                            width: MediaQuery.of(context).size.width,
                            height: MediaQuery.of(context).size.height - 80,
                            color: kContentColor,
                            child: profileRow())
                  ])))
        ],
      ),
    );
  }

  profileRow() {
    return Row(mainAxisAlignment: MainAxisAlignment.center, children: [
      Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        CircleAvatar(
          backgroundColor: Colors.white,
          radius: 85.0,
          child: CircleAvatar(
            backgroundImage: NetworkImage(_user.photoURL as String),
            radius: 80.0,
          ),
        ),
        SizedBox(height: 20),
        TextButton(
            onPressed: () {
              Navigator.pop(context);
            },
            child: const Text("Changer d'avatar")),
        SizedBox(height: 20),
        Container(
            width: 500,
            child: TextFormField(
              style: const TextStyle(fontSize: _fontSize),
              controller: userController,
              maxLines: 1,
              autofocus: false,
              decoration: InputDecoration(
                labelText: 'Pseudonyme',
                labelStyle: TextStyle(
                  fontSize: 25.0,
                ),
                errorStyle: const TextStyle(fontSize: _fontSize),
                hintText: "Pseudonyme",
                hintStyle: const TextStyle(
                  fontSize: _fontSize,
                ),
                contentPadding: const EdgeInsets.all(padding),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(3.0)),
              ),
              autovalidate: true,
            )),
        SizedBox(height: 20),
        Container(
            width: 500,
            child: TextFormField(
              style: const TextStyle(fontSize: _fontSize),
              controller: passController,
              maxLines: 1,
              autofocus: false,
              obscureText: !_passwordVisible,
              decoration: InputDecoration(
                  errorStyle: const TextStyle(fontSize: _fontSize),
                  hintText: "Nouveau mot de passe",
                  hintStyle: const TextStyle(
                    fontSize: _fontSize,
                  ),
                  contentPadding: const EdgeInsets.all(padding),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(3.0)),
                  suffixIcon: IconButton(
                      icon: Icon(
                        // Based on passwordVisible state choose the icon
                        _passwordVisible
                            ? Icons.visibility
                            : Icons.visibility_off,
                        color: Theme.of(context).primaryColorDark,
                      ),
                      onPressed: () {
                        // Update the state i.e. toogle the state of passwordVisible variable
                        setState(() {
                          _passwordVisible = !_passwordVisible;
                        });
                      })),
              enableSuggestions: false,
              autocorrect: false,
              autovalidate: true,
            ))
      ]),
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

  openAvatarDialog() {
    return ElevatedButton(
        onPressed: () {
          showDialog(
              context: context,
              builder: (BuildContext context) {
                return const AlertDialog(
                  title: Text("My Super title"),
                  content: Text("Hello World"),
                );
              });
        },
        child: const Text('Paramètres de compte',
            style: TextStyle(color: Colors.white)),
        style: ButtonStyle(
            backgroundColor: MaterialStateProperty.all(kPrimaryColor)));
  }
}
