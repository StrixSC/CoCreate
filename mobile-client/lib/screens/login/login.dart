import 'dart:convert';
import 'package:Colorimage/models/messenger.dart';
import 'package:Colorimage/models/user.dart';
import 'package:Colorimage/utils/rest/authentification_api.dart';
import 'package:Colorimage/utils/socket/channel.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/src/provider.dart';
import '../../app.dart';
import 'package:google_sign_in/google_sign_in.dart';
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

  bool usernameTaken = false;
  bool usernameEmpty = false;

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
    Map data = {'email': email, 'password': password};
    var body = json.encode(data);

    AuthenticationAPI rest = AuthenticationAPI();
    var response = await rest.login(body);

    if (response.statusCode == 200) {
      String rawCookie = response.headers['set-cookie'] as String;
      print(rawCookie);
      var jsonResponse = json.decode(response.body) as Map<String, dynamic>;
      var user = User(
          id: jsonResponse['user_id'],
          email: jsonResponse['email'],
          username: jsonResponse['username'],
          avatar_url: jsonResponse['avatar_url'],
          isActive: false,
          cookie: rawCookie);

      // Fetch initial user info
      context.read<Messenger>().updateUser(user);
      context.read<Messenger>().fetchChannels();
      context.read<Messenger>().fetchAllChannels();

      // Initialize socket connection
      initializeSocketConnection(user);

      // Home Page
      Navigator.pushNamed(context, homeRoute, arguments: {'user': user});

      print(user);
    } else {
      print('Login request failed with status: ${response.statusCode}.');
    }
  }

  void initializeSocketConnection(user) {
    IO.Socket socket = IO.io(
        'https://' + (dotenv.env['SERVER_URL'] ?? "localhost:5000"),
        // 'https://colorimage-109-3900.herokuapp.com/',
        // 'http://localhost:5000/',
        IO.OptionBuilder()
            .setExtraHeaders({'Cookie': user.cookie})
            .disableAutoConnect()
            .setTransports(['websocket']) // for Flutter or Dart VM
            .build());

    ChannelSocket channelSocket = ChannelSocket(user, socket);
    context.read<Messenger>().setSocket(channelSocket);
  }

  _toDrawing(BuildContext context) {
    IO.Socket socket = IO.io(
        'http://localhost:5000/',
        // 'http://edae-132-207-3-192.ngrok.io/',
        IO.OptionBuilder()
            .disableAutoConnect()
            .setTransports(['websocket']) // for Flutter or Dart VM
            .build());

    socket.connect();

    socket.on('connect', (_) {
      Navigator.pushNamed(context, drawingRoute, arguments: {'socket': socket});
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: null,
        body: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Form(
            key: _formKey,
            child: Expanded(
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
                  usernameTaken
                      ? const Padding(
                          padding: EdgeInsets.fromLTRB(30, 20, 0, 0),
                          child: Text("Le nom d'utilisateur est déjà pris",
                              style:
                                  TextStyle(color: Colors.red, fontSize: 25.0)))
                      : usernameEmpty
                          ? const Padding(
                              padding: EdgeInsets.fromLTRB(30, 20, 0, 0),
                              child: Text(
                                  "Veuillez entrer un nom d'utilisateur",
                                  style: TextStyle(
                                      color: Colors.red, fontSize: 25.0)))
                          : Text(""),
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
                  Padding(
                      padding: const EdgeInsets.fromLTRB(0, 30, 0, 30),
                      child: ElevatedButton(
                        onPressed: () {
                          _toDrawing(context);
                        },
                        style: ElevatedButton.styleFrom(
                            minimumSize: Size(80.0, 80.0)),
                        child: const Text('Dessiner sans connexion',
                            style: TextStyle(fontSize: 30.0)),
                      )),
                ],
              ),
            ),
          )
        ]));
  }
}
