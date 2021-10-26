import 'dart:convert';
import 'package:Colorimage/models/user.dart';
import 'package:Colorimage/utils/rest_api_service.dart';
import 'package:flutter/material.dart';
import '../../app.dart';
import 'package:http/http.dart' as http;
import 'dart:convert' as convert;
import 'package:flutter_dotenv/flutter_dotenv.dart';

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

  static const _fontSize = 25.0;
  static const padding = 30.0;

  _onSubmitTap(BuildContext context, String email, String password) {
    login(email, password);
    print("email  " + email + " password  " + password);
  }

  Future<void> login(email, password) async {

    Map data = {'email': email, 'password': password};
    //encode Map to JSON
    var body = json.encode(data);

    ColorimageRestAPI rest = ColorimageRestAPI();
    var response = await rest.login(body);

    if (response.statusCode == 200) {
      String? rawCookie = response.headers['set-cookie'];
      print(rawCookie);
      var jsonResponse = convert.jsonDecode(response.body) as Map<String, dynamic>;
      // var itemCount = jsonResponse['totalItems'];
      var user = User(user_id: jsonResponse['user_id'], email: jsonResponse['email'], username: jsonResponse['username'],
          avatar_url: jsonResponse['avatar_url'], isActive: false, cookie: rawCookie);

      Navigator.pushNamed(context, HomeRoute,
          arguments: {'user': user});

      print(user);
    } else {
      print('Request failed with status: ${response.body}.');
    }
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
                Padding(padding:  EdgeInsets.fromLTRB(0, 20, 0, 0), child:
                TextFormField(
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
                  autovalidate: true,
                  onFieldSubmitted: (value) {
                    if (_formKey.currentState!.validate()) {
                      _onSubmitTap(context, userController.text, passController.text);
                    }
                  },
                )),
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
                      _onSubmitTap(context, userController.text, passController.text);
                    }
                  },
                  style:
                      ElevatedButton.styleFrom(minimumSize: Size(80.0, 80.0)),
                  child: Text('Se connecter',
                      style: new TextStyle(fontSize: 30.0)),
                ),
                SizedBox(height: 24.0),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pushNamed(context, drawingRoute);
                  },
                  style:
                      ElevatedButton.styleFrom(minimumSize: Size(80.0, 80.0)),
                  child: Text('Dessiner sans connexion',
                      style: new TextStyle(fontSize: 30.0)),
                ),
              ],
            ),
          ),
        ]));
  }
}
