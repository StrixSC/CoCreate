import 'package:flutter/material.dart';
import '../../app.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

TextEditingController userController = TextEditingController();
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

  static const _fontSize = 25.0;
  static const padding = 30.0;

  _onSubmitTap(BuildContext context, String username) {
    // Initialize socket connection with server
    IO.Socket socket = IO.io(
        'http://10.200.24.176:5300/',
        IO.OptionBuilder()
            .disableAutoConnect()
            .setTransports(['websocket']) // for Flutter or Dart VM
            .build());

    socket.auth = {'username': username};

    socket.on('error', (err) {
      if (err['message'] == "Vous devez fournir un nom d'utilisateur!") {
        setState(() {
          usernameEmpty = true;
          usernameTaken = false;
        });


      } else if (err['message'] == "Ce nom d'utilisateur est déjà utilisé, choisissez-en en autre!") {
        setState(() {
          usernameEmpty = false;
          usernameTaken = true;
        });
      }

      socket.dispose();
    });

    socket.connect();

    socket.on('connect', (_) {
      setState(() {
        usernameEmpty = false;
        usernameTaken = false;
      });
      socket.emit('join-channel', {'username': username});
      Navigator.pushNamed(context, ChatRoute,
          arguments: {'username': username, 'socket': socket});
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: null,
        body: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Form(
            key: _formKey,
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
                hintText: "Nom d'utilisateur",
                hintStyle: const TextStyle(
                  fontSize: _fontSize,
                ),
                contentPadding: const EdgeInsets.all(padding),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.0)),
              ),
              autovalidate: true,
              onFieldSubmitted: (value) {
                if (_formKey.currentState!.validate()) {
                  _onSubmitTap(
                      context, userController.text);
                }
              },
          ),
                usernameTaken
                    ? Padding(
                        padding: EdgeInsets.fromLTRB(30, 20, 0, 0),
                        child: Text("Le nom d'utilisateur est déjà pris",
                            style: new TextStyle(
                                color: Colors.red, fontSize: 25.0)))
                    : usernameEmpty
                        ? Padding(
                            padding: EdgeInsets.fromLTRB(30, 20, 0, 0),
                            child: Text("Veuillez entrer un nom d'utilisateur",
                                style: new TextStyle(
                                    color: Colors.red, fontSize: 25.0)))
                        : Text(""),
                SizedBox(height: 24.0),
                ElevatedButton(
                  onPressed: () {
                    // Validate will return true if the form is valid, or false if
                    // the form is invalid.
                    if (_formKey.currentState!.validate()) {
                      _onSubmitTap(
                          context, userController.text);
                    }
                  },
                  style:
                      ElevatedButton.styleFrom(minimumSize: Size(80.0, 80.0)),
                  child: Text('Se connecter',
                      style: new TextStyle(fontSize: 30.0)),
                ),
              ],
            ),
          ),
        ]));
  }
}
