import 'package:Colorimage/providers/messenger.dart';
import 'package:Colorimage/utils/rest/rest_api.dart';
import 'package:Colorimage/utils/socket/channel.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/src/provider.dart';
import '../../app.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

TextEditingController userController = TextEditingController();
TextEditingController passController = TextEditingController();
Color primaryColor =
    Color(int.parse(('#3FA3FF').substring(1, 7), radix: 16) + 0xFF000000);

class Login extends StatefulWidget {
  const Login({Key? key}) : super(key: key);

  @override
  _LoginState createState() => _LoginState();
}

class _LoginState extends State<Login> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  String errorMessage = "";
  late UserCredential userCredential;

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
      userCredential = await FirebaseAuth.instance
          // .signInWithEmailAndPassword(email: email, password: password);
          .signInWithEmailAndPassword(
              email: "demo@demo.com", password: "demodemo");
    } on FirebaseAuthException catch (e) {
      setState(() {
        errorMessage = e.message!;
      });
      return;
    }

    var token = await FirebaseAuth.instance.currentUser!.getIdToken();

    RestApi rest = RestApi();
    var response = await rest.auth.login(token);

    if (response.statusCode == 202) {
      print(response.body); // Initialize socket connection

      initializeSocketConnection(userCredential, token);

      // Fetch initial user info
      context.read<Messenger>().updateUser(userCredential);
      context.read<Messenger>().fetchChannels();
      context.read<Messenger>().fetchAllChannels();

      // Home Page
      // Navigator.pushNamed(context, homeRoute);
      Navigator.pushNamed(context, drawingRoute, arguments: {
        'socket': context.read<Messenger>().channelSocket.socket,
        'user': userCredential.user
      });

      print(userCredential.user);
    } else {
      print('Login request failed with status: ${response.statusCode}.');
    }
  }

  void initializeSocketConnection(auth, token) {
    IO.Socket socket = IO.io(
        'https://' + (dotenv.env['SERVER_URL'] ?? "localhost:5000"),
        IO.OptionBuilder()
            // .setAuth({token:token})
            .setExtraHeaders({'Authorization': 'Bearer ' + token})
            .disableAutoConnect()
            .setTransports(['websocket']) // for Flutter or Dart VM
            .build());

    ChannelSocket channelSocket = ChannelSocket(auth.user, socket);
    context.read<Messenger>().setSocket(channelSocket);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: null,
        body: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Form(
            key: _formKey,
            child: Flexible(
              child: ListView(
                shrinkWrap: true,
                padding: EdgeInsets.only(left: 100.0, right: 100.0),
                children: <Widget>[
                  SizedBox(height: 48.0),
                  Text('Connexion',
                      style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 40.0,
                          color: primaryColor)),
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
                          borderRadius: BorderRadius.circular(12.0)),
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
                        decoration: InputDecoration(
                          errorStyle: const TextStyle(fontSize: _fontSize),
                          hintText: "Password",
                          hintStyle: const TextStyle(
                            fontSize: _fontSize,
                          ),
                          contentPadding: const EdgeInsets.all(padding),
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12.0)),
                        ),
                        obscureText: true,
                        enableSuggestions: false,
                        autocorrect: false,
                        autovalidate: true,
                        onFieldSubmitted: (value) {
                          if (_formKey.currentState!.validate()) {
                            login(userController.text, passController.text);
                          }
                        },
                      )),
                  const SizedBox(height: 24.0),
                  ElevatedButton(
                    onPressed: () {
                      // Validate will return true if the form is valid, or false if
                      // the form is invalid.
                      if (_formKey.currentState!.validate()) {
                        login(userController.text, passController.text);
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
        ]));
  }
}
