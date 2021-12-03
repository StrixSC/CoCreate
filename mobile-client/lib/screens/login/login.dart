import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/providers/collaborator.dart';
import 'package:Colorimage/providers/messenger.dart';
import 'package:Colorimage/providers/team.dart';
import 'package:Colorimage/utils/rest/rest_api.dart';
import 'package:Colorimage/utils/socket/channel.dart';
import 'package:Colorimage/utils/socket/collaboration.dart';
import 'package:Colorimage/utils/socket/team.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/src/provider.dart';
import 'package:translator/translator.dart';
import '../../app.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

TextEditingController userController = TextEditingController();
TextEditingController passController = TextEditingController();
Color primaryColor =
    Color(int.parse(('#3FA3FF').substring(1, 7), radix: 16) + 0xFF000000);

class Login extends StatefulWidget {
  const Login({Key? key})
      : super(
          key: key,
        );

  @override
  _LoginState createState() => _LoginState();
}

class _LoginState extends State<Login> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  String errorMessage = "";
  final translator = GoogleTranslator();
  late UserCredential userCredential;
  bool _passwordVisible = false;

  final logo = Hero(
    tag: 'hero',
    child: CircleAvatar(
      backgroundColor: Colors.transparent,
      radius: 48.0,
      child: Image.asset('assets/images/logo.png'),
    ),
  );

  static const _fontSize = 20.0;
  static const padding = 30.0;

  Future<void> login(email, password) async {
    try {
      // TODO : Don't forget to uncomment controllers at the end
      userCredential = await FirebaseAuth.instance
          // .signInWithEmailAndPassword(email: email, password: password);
          .signInWithEmailAndPassword(email: "pri@pri.com", password: "pripri123");
    } on FirebaseAuthException catch (e) {
      await translator.translate(e.message!, from: 'en', to: 'fr').then((value) => errorMessage = value.text);
      setState(() {
        errorMessage;
      });
      return;
    }

    var token = await FirebaseAuth.instance.currentUser!.getIdToken();

    RestApi rest = RestApi();
    var response = await rest.auth.login(token);

    if (response.statusCode == 202) {
      initializeSocketConnection(userCredential, token);

      // Fetch initial user info
      context.read<Messenger>().updateUser(userCredential);
      context.read<Collaborator>().updateUser(userCredential);
      context.read<Teammate>().updateUser(userCredential);
      context.read<Messenger>().fetchChannels();
      context.read<Messenger>().fetchAllChannels();

      // Home Page
      Navigator.pushNamed(context, homeRoute);
      // Navigator.pushNamed(context, drawingRoute, arguments: {'socket': context.read<Messenger>().channelSocket.socket});

    } else {
      print('Login request failed with status: ${response.statusCode}.');
    }
  }

  void initializeSocketConnection(auth, token) {
    IO.Socket socket = IO.io(
        'https://' + (dotenv.env['SERVER_URL'] ?? "localhost:5000"),
        IO.OptionBuilder()
            .setExtraHeaders({'Authorization': 'Bearer ' + token})
            .disableAutoConnect()
            .setTransports(['websocket']) // for Flutter or Dart VM
            .build());

    CollaborationSocket collaborationSocket = CollaborationSocket(auth.user, socket);
    ChannelSocket channelSocket = ChannelSocket(auth.user, socket);
    TeamSocket teamSocket = TeamSocket(auth.user, socket);
    context.read<Messenger>().setSocket(channelSocket);
    context.read<Teammate>().setSocket(teamSocket);
    context.read<Collaborator>().setSocket(collaborationSocket);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: null,
        body: Center(child: Container( width: 800, child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Text('Colorimage',
              style: TextStyle(
                fontFamily: GoogleFonts.yellowtail().fontFamily,
                fontWeight: FontWeight.w200,
                fontSize: 100.0,
                color: Colors.white,)),
          Form(
            key: _formKey,
            child: Flexible(
              child: ListView(
                shrinkWrap: true,
                padding: EdgeInsets.only(left: 100.0, right: 100.0),
                children: <Widget>[
                  SizedBox(height: 48.0),
                  errorMessage.isNotEmpty
                      ? Padding(
                          padding: const EdgeInsets.fromLTRB(30, 20, 0, 0),
                          child: Text(errorMessage,
                              style: const TextStyle(
                                  color: Colors.red, fontSize: 25.0)))
                      : const SizedBox.shrink(),
                  SizedBox(height: 24.0),
                 TextFormField(
                    style: const TextStyle(fontSize: _fontSize),
                    controller: userController,
                    maxLines: 1,
                    autofocus: false,
                    decoration: InputDecoration(
                      errorStyle: const TextStyle(fontSize: _fontSize),
                      hintText: "Courriel",
                      hintStyle: const TextStyle(
                        fontSize: _fontSize,
                      ),
                      contentPadding: const EdgeInsets.all(padding),
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(3.0)),
                    ),
                    autovalidate: true,
                    // onFieldSubmitted: (value) {
                    //   if (_formKey.currentState!.validate()) {
                    //     _onSubmitTap(context, userController.text);
                    //   }
                    // },
                  ),
                  Padding(
                      padding: EdgeInsets.fromLTRB(0, 20, 0, 0),
                      child: TextFormField(
                        style: const TextStyle(fontSize: _fontSize),
                        controller: passController,
                        maxLines: 1,
                        autofocus: false,
                        obscureText: !_passwordVisible,
                        decoration: InputDecoration(
                            errorStyle: const TextStyle(fontSize: _fontSize),
                            hintText: "Mot de passe",
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
                      )),
                  const SizedBox(height: 24.0),
                  ElevatedButton(
                    onPressed: () {
                      // Validate will return true if the form is valid, or false if
                      // the form is invalid.
                      // TODO: Uncomment this
                      if (_formKey.currentState!.validate()) {
                        // if(userController.text.isEmpty) {
                        //   setState(() {
                        //     errorMessage = "Veuillez saisir un courriel.";
                        //   });
                        // } else if(passController.text.isEmpty) {
                        //   setState(() {
                        //     errorMessage = "Veuillez saisir un mot de passe.";
                        //   });
                        // } else {
                          login(userController.text, passController.text);
                        // }
                      }
                    },
                    style:
                        ElevatedButton.styleFrom(minimumSize: Size(80.0, 80.0)),
                    child: Text('Se connecter',
                        style: new TextStyle(fontSize: 26.0)),
                  ),
                  Padding(
                      padding: EdgeInsets.fromLTRB(0, 30, 0, 0),
                      child: ElevatedButton(
                        onPressed: () {
                          // Validate will return true if the form is valid, or false if
                          Navigator.pushNamed(context, registerRoute);
                        },
                        style: ElevatedButton.styleFrom(
                            minimumSize: Size(80.0, 80.0)),
                        child: Text('Créer un compte',
                            style: new TextStyle(fontSize: 26.0)),
                      )),
                ],
              ),
            ),
          )
        ]))));
  }
}
