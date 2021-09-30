import 'package:flutter/material.dart';
import '../../app.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

TextEditingController userController = TextEditingController();
TextEditingController ipController = TextEditingController();
Color primaryColor =
    Color(int.parse(('#3FA3FF').substring(1, 7), radix: 16) + 0xFF000000);

class Login extends StatefulWidget {
  const Login({Key? key}) : super(key: key);
  @override
  _LoginState createState() => _LoginState();
}

class _LoginState extends State<Login> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    // initSocket();
  }

  void initSocket() {
    IO.Socket socket = IO.io(
        'https://colorimage-109-3900.herokuapp.com/',
        IO.OptionBuilder()
            .setTransports(['websocket']) // for Flutter or Dart VM
            .build());
    socket.on('connect', (_) {
      print('connect');
    });
    socket.on('disconnect', (_) => print('disconnect'));
  }

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

  // The username field text box
  final usernameField = TextFormField(
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
    validator: (String? value) {
      if (value == null || value.isEmpty) {
        return "Veuillez entrer un nom d'utilisateur";
      }
      return null;
    },
  );

  final ipField = TextFormField(
    style: const TextStyle(fontSize: _fontSize),
    controller: ipController,
    maxLines: 1,
    autofocus: false,
    decoration: InputDecoration(
      errorStyle: TextStyle(fontSize: _fontSize),
      hintText: "Adresse IP (e.g. 192.168.2.1)",
      hintStyle: new TextStyle(
        fontSize: _fontSize,
      ),
      contentPadding: EdgeInsets.all(padding),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.0)),
    ),
    validator: (String? value) {
      if (value == null || value.isEmpty) {
        return null;
      }
      return null;
    },
  );

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
                usernameField,
                SizedBox(height: 24.0),
                ipField,
                SizedBox(height: 24.0),
                ElevatedButton(
                  onPressed: () {
                    // Validate will return true if the form is valid, or false if
                    // the form is invalid.
                    if (_formKey.currentState!.validate()) {
                      _onSubmitTap(
                          context, userController.text, ipController.text);
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

  _onSubmitTap(BuildContext context, String username, String ip) {
    // Initialize socket connection with server
    IO.Socket socket = IO.io(
        'http://localhost:3000/',
        IO.OptionBuilder()
            .setTransports(['websocket']) // for Flutter or Dart VM
            .build());

    socket.on('connect', (_) {
      print(username);
    });

    // socket.on('user-connection', (username) => {print(username)});
    // socket.on('exception', (exception) => {print(exception['message'])});

    // Join chat channel
    socket.emit('join-channel', {'username': username});

    Navigator.pushNamed(context, ChatRoute,
        arguments: {'username': username, 'socket': socket});
  }
}
