import 'dart:convert';

import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/god.dart';
import 'package:Colorimage/providers/collaborator.dart';
import 'package:Colorimage/providers/messenger.dart';
import 'package:Colorimage/screens/profile/historique.dart';
import 'package:Colorimage/screens/profile/statistique.dart';
import 'package:Colorimage/screens/profile/update_profile.dart';
import 'package:Colorimage/utils/rest/rest_api.dart';
import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:persistent_bottom_nav_bar/persistent-tab-view.dart';
import 'package:provider/src/provider.dart';
import 'package:translator/translator.dart';

import '../../app.dart';

class Profile extends StatefulWidget {
  final User _user;

  Profile(this._user);

  @override
  _ProfileScreenState createState() => _ProfileScreenState(_user);
}

TextEditingController userController = TextEditingController();
TextEditingController passController = TextEditingController();

class _ProfileScreenState extends State<Profile> {
  List<String> entries = <String>['1', '2', '3', '4', '5'];
  List colorCodes = [
    kContentColor2,
    Colors.black,
    kContentColor2,
    kContentColor2,
    kContentColor3
  ];
  List<double> height = <double>[250.0, 2.0, 150.0, 180.0, 300.0];
  late List children;
  bool isAuthor = false;
  User _user;
  final List<int> numbers = [1, 2, 3, 5, 8, 13, 21, 34, 55];
  _ProfileScreenState(this._user);
  final translator = GoogleTranslator();
  bool isConfidential = false;

  UserResponse user = UserResponse();

  static const _fontSize = 20.0;
  static const padding = 30.0;
  bool _passwordVisible = false;
  final GlobalKey<FormState> _formKeyForgotPass = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    isAuthor = context.read<Collaborator>().auth!.user!.uid == _user.uid;
    fetchUserInfo();
  }

  fetchUserInfo() async {
    RestApi rest = RestApi();
    var response = await rest.user.fetchUserAccount();
    var data = json.decode(response.body); //Map<String, dynamic>;
    print(data['user_id']);
    user.user_id = data['user_id'];
    user.email = data['email'];

    for(var authored in data['authored_collaborations']) {
      user.authored_collaborations.add(authored);
    }
    for(var team in data['teams']) {
      user.teams.add(team);
    }
    for(var log in data['logs']) {
      user.logs.add(log);
    }

    user.account = data['account'];
    user.stats = data['stats'];

    setState(() {
      user;
    });

    // for (var drawing in resp) {
    //   if (drawing != null) {
    //
    //   }
    // }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: const Key('Profile'),
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
          backgroundColor: kPrimaryColor,
          centerTitle: true,
          leadingWidth: 300.0,
          title: Text('Profile de ' + _user.displayName.toString()),
          automaticallyImplyLeading: false,
          leading: // Ensure Scaffold is in context
              ElevatedButton(
                  child: Container(
                      child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                        Icon(Icons.exit_to_app_outlined,
                            color: Colors.white, size: 28),
                        SizedBox(
                          width: 10.0,
                        ),
                        Text('Se déconnecter', style: TextStyle(fontSize: 28.0))
                      ])),
                  onPressed: () {
                    AwesomeDialog(
                      context: navigatorKey.currentContext as BuildContext,
                      width: 800,
                      dismissOnTouchOutside: false,
                      dialogType: DialogType.WARNING,
                      animType: AnimType.BOTTOMSLIDE,
                      title: 'Attention!',
                      desc: 'Êtes-vous certain de vouloir vous déconnecter?.',
                      btnCancelOnPress: () {
                        Navigator.pop(context);
                      },
                      btnOkOnPress: () {
                        context
                            .read<Collaborator>()
                            .collaborationSocket
                            .socket
                            .dispose();
                        signOut(navigatorKey.currentContext);
                      },
                    ).show();
                  }),
          actions: <Widget>[
            IconButton(
                icon: Icon(Icons.message),
                onPressed: () => context.read<Messenger>().openDrawer()),
          ]),
      body: Column(
        children: <Widget>[
          Expanded(
              child: ListView.builder(
                  scrollDirection: Axis.vertical,
                  shrinkWrap: true,
                  padding: const EdgeInsets.all(8),
                  itemCount: entries.length,
                  itemBuilder: (BuildContext context, int index) {
                    if (isAuthor) {
                      return index != 1
                          ? Container(
                              height: height[index],
                              color: colorCodes[index],
                              child: Widgets(index))
                          : Widgets(index);
                    } else {
                      if (index != 2 && index != 3) {
                        return index != 1
                            ? Container(
                                height: height[index],
                                color: colorCodes[index],
                                child: Widgets(index))
                            : Widgets(index);
                      }
                      return Container();
                    }
                  }))
        ],
      ),
    );
  }

  signOut(context) async {
    try {
      await FirebaseAuth.instance.signOut().whenComplete(() {
        Navigator.pushReplacementNamed(context, loginRoute);
      });
    } on FirebaseAuthException catch (e) {
      await translator
          .translate(e.message!, from: 'en', to: 'fr')
          .then((value) => AwesomeDialog(
                context: navigatorKey.currentContext as BuildContext,
                width: 800,
                btnOkColor: Colors.red,
                dismissOnTouchOutside: false,
                dialogType: DialogType.ERROR,
                animType: AnimType.BOTTOMSLIDE,
                title: 'Erreur!',
                desc: value.text,
                btnOkOnPress: () {},
              ).show());
      return;
    }
  }

  Widgets(index) {
    switch (index) {
      case 0:
        return profileRow();
      case 1:
        return divider();
      case 2:
        return forgotPass();
      case 3:
        return confident();
      case 4:
        return postedDrawings();
      default:
        return Row(children: [Container()]);
    }
  }

  profileRow() {
    return Container(
        decoration: isAuthor ? shadow() : null,
        margin: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 15.0),
        child: Row(
            mainAxisAlignment: isAuthor
                ? MainAxisAlignment.spaceBetween
                : MainAxisAlignment.center,
            children: [
              const SizedBox(width: 20),
              Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                CircleAvatar(
                  backgroundColor: Colors.white,
                  radius: 85.0,
                  child: CircleAvatar(
                    backgroundImage: NetworkImage(_user.photoURL as String),
                    radius: 80.0,
                  ),
                ),
                // const SizedBox(height: 10),
                // Text('@' + _user.displayName.toString(), style: TextStyle(fontWeight: FontWeight.bold))
              ]),
              isAuthor
                  ? Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                          Text('Informations personnelles',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 35.0)),
                          Row(children: [
                            Text('Courriel: ',
                                style: TextStyle(fontWeight: FontWeight.bold)),
                            Text(_user.email.toString(),
                                style: TextStyle(fontSize: 25.0))
                          ]),
                          Row(children: [
                            Text('Nom: ',
                                style: TextStyle(fontWeight: FontWeight.bold)),
                            Text(user.account.isNotEmpty ? user.account['last_name'] : '',
                                style: TextStyle(fontSize: 25.0))
                          ]),
                          Row(children: [
                            Text('Prenom: ',
                                style: TextStyle(fontWeight: FontWeight.bold)),
                            Text(user.account.isNotEmpty ? user.account['first_name'] : '',
                                style: TextStyle(fontSize: 25.0))
                          ]),
                        ])
                  : const SizedBox.shrink(),
              isAuthor
                  ? Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                          history(),
                          settings(),
                          statistics(),
                        ])
                  : const SizedBox.shrink(),
              const SizedBox(width: 50),
            ]));
  }

  divider() {
    return const Divider(
      color: Colors.black,
      height: 0,
      thickness: 0,
    );
  }

  forgotPass() {
    return Container(
        height: 100.0,
        decoration: shadow(),
        margin: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 15.0),
        child:
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Padding(
              padding: EdgeInsets.only(left: 70.0),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Mot de passe',
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 35.0)),
                  ])),
          Padding(
              padding: EdgeInsets.only(right: 100.0),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ElevatedButton(
                        onPressed: () {
                          userController.clear();
                          passController.clear();
                          forgotDialog();
                        },
                        child: const Text('Modifier',
                            style: TextStyle(color: Colors.white)),
                        style: ButtonStyle(
                            backgroundColor:
                                MaterialStateProperty.all(kPrimaryColor))),
                  ]))
        ]));
  }

  confident() {
    return Container(
        height: 100.0,
        decoration: shadow(),
        margin: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 15.0),
        child:
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Padding(
              padding: EdgeInsets.only(left: 70.0),
              child: Container(
                  width: 800.0,
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Text('Niveau de confidentialité',
                            style: TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 35.0)),
                        Text(
                            "En activant ce réglage, vous permettez à tout les utilisateurs d'utiliser vos informations personneles, telles que votre prénom, votre nom et votre courriel, comme mots-clés de filtrage supplémentaires.",
                            style: TextStyle(fontSize: 20.0)),
                      ]))),
          Padding(
              padding: EdgeInsets.only(right: 100.0),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(
                        child: Row(children: [
                      toggleSwitch('owner'),
                    ]))
                  ]))
        ]));
  }

  forgotDialog() async {
    showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
          titlePadding: EdgeInsets.zero,
          title: Container(
              padding: EdgeInsets.all(10.0),
              color: kContentColor,
              child: const Center(
                  child: Text('Modifier le votre mot de passe'))),
          content: SingleChildScrollView(child: forgot()),
          actions: <Widget>[
            Padding(
                padding: EdgeInsets.fromLTRB(0, 0, 25.0, 20.0),
                child: Container(
                    height: 50,
                    child: ElevatedButton(
                      onPressed: () async {
                        if (_formKeyForgotPass.currentState!.validate()) {
                        RestApi rest = RestApi();
                        var response = await rest.user.updatePassword(passController.text);
                        if(response.statusCode == 200) {
                          Navigator.pop(context);
                          AwesomeDialog(
                            context: navigatorKey.currentContext
                            as BuildContext,
                            width: 800,
                            dismissOnTouchOutside: false,
                            dialogType: DialogType.SUCCES,
                            animType: AnimType.BOTTOMSLIDE,
                            title: 'Succès!',
                            desc:
                            'Vous avez change de mot de passe! 😄',
                            btnOkOnPress: () {
                            },
                          ).show();
                        } else {
                          AwesomeDialog(
                            context: navigatorKey.currentContext
                            as BuildContext,
                            width: 800,
                            btnOkColor: Colors.red,
                            dismissOnTouchOutside: false,
                            dialogType: DialogType.ERROR,
                            animType: AnimType.BOTTOMSLIDE,
                            title: 'Erreur!',
                            desc: 'Une erreur ${response.body.toString()}',
                            btnOkOnPress: () {},
                          ).show();
                        }
                        }
                      },
                      child: const Text('Modifier'),
                    ))),
          ],
        ));
  }

  forgot() {
    return Container(
        width: 1000,
        child: Form(
            key: _formKeyForgotPass,
            child: Column(children: <Widget>[
              const SizedBox(height: 28.0),
              SizedBox(
                  width: 900,
                  child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        SizedBox(
                          height: 30,
                        ),
                        SizedBox(
                          width: 800,
                          child: formField("Mot de passe", passController),
                        ),
                        SizedBox(
                          height: 50,
                        ),
                        SizedBox(
                          width: 800,
                          child: formField("Confirmation du mot de passe", userController),
                        ),
                      ])),
            ])));
  }

  toggleSwitch(type) {
    return Row(children: [
      Switch(
        value: isConfidential,
        onChanged: (value) async {
          setState(() {
            isConfidential = value;
          });
          RestApi rest = RestApi();
          var response = await rest.user.changeUserConfidentiality(value);
          if (response.statusCode == 200) {
            AwesomeDialog(
              context: navigatorKey.currentContext as BuildContext,
              width: 800,
              dismissOnTouchOutside: false,
              dialogType: DialogType.SUCCES,
              animType: AnimType.BOTTOMSLIDE,
              title: 'Succès!',
              desc: value == false
                  ? "Tout le monde pourra vous chercher 😉"
                  : "Personne vous retrouvera par recherche 🥸",
              btnOkOnPress: () {},
            ).show();
          }
        },
        activeTrackColor: kPrimaryColor.withOpacity(0.5),
        activeColor: kPrimaryColor,
      ),
    ]);
  }

// PUT /api/auth/update/password pour update mdp
  // POST /api/users/update/avatar
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

  formField(String hintText, TextEditingController textController) {
    return TextFormField(
      controller: textController,
      obscureText: (hintText == 'Mot de passe' || hintText == "Confirmation du mot de passe") && !_passwordVisible,
      enableSuggestions: false,
      style: const TextStyle(fontSize: _fontSize),
      maxLines: 1,
      autofocus: false,
      decoration: InputDecoration(
          errorStyle: const TextStyle(fontSize: _fontSize),
          hintText: hintText,
          helperText: hintText == 'Mot de passe'
              ? "Alphanumérique et doit être entre 8 et 256 caractères"
              : hintText == "Nom d'utilisateur*"
              ? "Alphanumérique"
              : " ",
          helperStyle: TextStyle(fontSize: 15.0),
          hintStyle: const TextStyle(
            fontSize: _fontSize,
          ),
          contentPadding: const EdgeInsets.all(padding),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(3.0)),
          suffixIcon: IconButton(
              icon: Icon(
                // Based on passwordVisible state choose the icon
                _passwordVisible ? Icons.visibility : Icons.visibility_off,
                color: Theme.of(context).primaryColorDark,
              ),
              onPressed: () {
                // Update the state i.e. toogle the state of passwordVisible variable
                setState(() {
                  _passwordVisible = !_passwordVisible;
                });
              })),
      validator: (value) {
        RegExp regExp = RegExp(r'^[a-zA-Z0-9]+$');
        if (value == null || value.isEmpty) {
          return 'Veuillez remplir cette option svp.';
        } else if (textController == passController || textController == userController) {
          // alphanumeric
          if (value.length < 4) {
            return 'Le mot de passe doit avoir 4 caractères au minimum';
          } else if (!regExp.hasMatch(value)) {
            return 'Votre mot de passe ne peut pas contenir de symbole!';
          }
        } if(passController.text != userController.text) {
          return 'Les mots de passe ne concordent pas!';
        }

        _formKeyForgotPass.currentState!.save();
        return null;
      },
    );
  }

  settings() {
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

  history() {
    return ElevatedButton(
        onPressed: () {
          pushNewScreen(
            context,
            screen: HistoriqueProfile(_user),
            withNavBar: false,
            pageTransitionAnimation: PageTransitionAnimation.cupertino,
          );
        },
        child: const Text('Historique', style: TextStyle(color: Colors.white)),
        style: ButtonStyle(
            backgroundColor: MaterialStateProperty.all(kPrimaryColor)));
  }

  statistics() {
    return ElevatedButton(
        onPressed: () {
          pushNewScreen(
            context,
            screen: StatistiqueProfile(_user),
            withNavBar: false,
            pageTransitionAnimation: PageTransitionAnimation.cupertino,
          );
        },
        child:
            const Text('Statistiques', style: TextStyle(color: Colors.white)),
        style: ButtonStyle(
            backgroundColor: MaterialStateProperty.all(kPrimaryColor)));
  }

  shadow() {
    return BoxDecoration(
        color: kContentColor,
        border: Border.all(width: 2.5, color: Colors.white.withOpacity(0.15)));
  }
}
