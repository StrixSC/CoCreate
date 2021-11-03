import 'dart:convert';
import 'package:Colorimage/utils/rest/authentification_api.dart';
import 'package:flutter/material.dart';
import '../../app.dart';

TextEditingController emailController = TextEditingController();
TextEditingController passController = TextEditingController();
TextEditingController usernameController = TextEditingController();
TextEditingController firstNameController = TextEditingController();
TextEditingController lastNameController = TextEditingController();

Color primaryColor =
    Color(int.parse(('#3FA3FF').substring(1, 7), radix: 16) + 0xFF000000);

class Register extends StatefulWidget {
  const Register({Key? key})
      : super(
          key: key,
        );

  @override
  _RegisterState createState() => _RegisterState();
}

class _RegisterState extends State<Register> {
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

  register(userInfo) async {
    Map data = userInfo;
    var body = json.encode(data);

    AuthenticationAPI rest = AuthenticationAPI();
    var response = await rest.register(body);

    if (response.statusCode == 201) {
      print(response.body);
      return showDialog<String>(
          context: context,
          builder: (BuildContext context) => AlertDialog(
                title: Text('Bravo! Votre compte à été créer avec succès.'),
                content: const Text('Amusez-vous! 😄'),
                actions: <Widget>[
                  TextButton(
                    onPressed: () {
                      Navigator.pop(context, 'Ok');
                      Navigator.pushNamed(context, LoginRoute);
                    },
                    child: const Text('Ok'),
                  ),
                ],
              ));
    } else {
      print('Register request failed with status: ${response.statusCode}.');
    }
  }

  textForm(hintText, controller) {
    return hintText != "Mot de Passe"
        ? TextFormField(
            style: const TextStyle(fontSize: _fontSize),
            controller: controller,
            maxLines: 1,
            autofocus: false,
            decoration: InputDecoration(
              errorStyle: const TextStyle(fontSize: _fontSize),
              hintText: hintText,
              hintStyle: const TextStyle(
                fontSize: _fontSize,
              ),
              contentPadding: const EdgeInsets.all(padding),
              border:
                  OutlineInputBorder(borderRadius: BorderRadius.circular(12.0)),
            ),
            autovalidate: true,
            onFieldSubmitted: (value) {
              if (_formKey.currentState!.validate()) {
                Map userInfo = {
                  'email': emailController.text,
                  'password': passController.text,
                  'username': usernameController.text,
                  'first_name': firstNameController.text,
                  'last_name': lastNameController.text
                };
                register(userInfo);
              }
            },
          )
        : TextFormField(
            style: const TextStyle(fontSize: _fontSize),
            controller: controller,
            maxLines: 1,
            autofocus: false,
            decoration: InputDecoration(
              errorStyle: const TextStyle(fontSize: _fontSize),
              hintText: hintText,
              hintStyle: const TextStyle(
                fontSize: _fontSize,
              ),
              contentPadding: const EdgeInsets.all(padding),
              border:
                  OutlineInputBorder(borderRadius: BorderRadius.circular(12.0)),
            ),
            obscureText: true,
            enableSuggestions: false,
            autocorrect: false,
            autovalidate: true,
            onFieldSubmitted: (value) {
              if (_formKey.currentState!.validate()) {
                Map userInfo = {
                  'email': emailController.text,
                  'password': passController.text,
                  'username': usernameController.text,
                  'first_name': firstNameController.text,
                  'last_name': lastNameController.text
                };
                register(userInfo);
              }
            },
          );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: null,
        body: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Form(
                key: _formKey,
                child: Flexible(
                    child: ListView(
                  shrinkWrap: true,
                  padding: EdgeInsets.only(left: 100.0, right: 100.0),
                  children: <Widget>[
                    SizedBox(height: 48.0),
                    Text("S'inscrire",
                        style: TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 40.0,
                            color: primaryColor)),
                    SizedBox(height: 24.0),
                    textForm('Courriel', emailController),
                    const SizedBox(height: 24.0),
                    textForm('Mot de Passe', passController),
                    const SizedBox(height: 24.0),
                    textForm("Nom d'utilisateur", usernameController),
                    const SizedBox(height: 24.0),
                    textForm('Prénom', firstNameController),
                    const SizedBox(height: 24.0),
                    textForm('Nom', lastNameController),
                    const SizedBox(height: 24.0),
                    ElevatedButton(
                      onPressed: () {
                        // Validate will return true if the form is valid, or false if
                        // the form is invalid.
                        if (_formKey.currentState!.validate()) {
                          Map userInfo = {
                            'email': emailController.text,
                            'password': passController.text,
                            'username': usernameController.text,
                            'first_name': firstNameController.text,
                            'last_name': lastNameController.text
                          };
                          register(userInfo);
                        }
                      },
                      style: ElevatedButton.styleFrom(
                          minimumSize: Size(80.0, 80.0)),
                      child: Text('Créer compte',
                          style: new TextStyle(fontSize: 30.0)),
                    ),
                  ],
                )),
              ),
            ]));
  }
}
