import 'dart:convert';
import 'package:Colorimage/utils/rest/rest_api.dart';
import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../app.dart';
import 'package:Colorimage/constants/general.dart';
import 'package:flutter/cupertino.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'dart:async';

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
  bool _passwordVisible = false;
  bool usernameTaken = false;
  bool usernameEmpty = false;

  String currentAvatar = 'https://cdn-icons-png.flaticon.com/512/103/103410.png';
  bool isFromAvatarList = true;
  File? _image;
  bool isPicture = false;
  int? currentlySelectedIndex;
  List avatars = [];

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

  @override
  void initState() {
    super.initState();
    _passwordVisible = false;
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
                // Map userInfo = {
                //   'email': emailController.text,
                //   'password': passController.text,
                //   'username': usernameController.text,
                //   'first_name': firstNameController.text,
                //   'last_name': lastNameController.text
                // };
                registerNewUser(_image);
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
              }
            },
          );
  }

  @override
  Widget build(BuildContext context) {
    var width = 500.0;
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
                    SizedBox(height: 38.0),
                    const Text("Inscription",
                        style: TextStyle(
                            fontWeight: FontWeight.w800, fontSize: 40.0)),
                    SizedBox(height: 14.0),
                    Container(
                        child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                          Container(
                              width: width,
                              child: formField(
                                  "Nom d'utilisateur*", usernameController)),
                          Container(
                              width: width,
                              child:        Column(children: [CircleAvatar(
                                backgroundColor: Colors.white,
                                radius: 85.0,
                                child: CircleAvatar(
                                  backgroundImage: isPicture ? Image.file(_image!).image : NetworkImage(currentAvatar),
                                  radius: 80.0,
                                ),
                              ),
                            SizedBox(height: 10),
                            openAvatarDialog()])),
                        ])),
                    const SizedBox(height: 34.0),
                    Container(
                        child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                          Container(
                            width: width,
                            child: formField('Courriel*', emailController),
                          ),
                          Container(
                              width: width,
                              child: formField('Mot de Passe*', passController)),
                        ])),
                    const SizedBox(height: 34.0),
                    Container(
                        child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                          Container(
                            width: width,
                            child: formField('Nom*', lastNameController),
                          ),
                          Container(
                              width: width,
                              child: formField('Prenom*', firstNameController)),
                        ])),
                    const SizedBox(height: 14.0),
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      Row(children: [Text('Déjà un compte? ',
                          style: new TextStyle(fontSize: 26.0)),
                      TextButton(
                        onPressed: () {
                          // Validate will return true if the form is valid, or false if
                          Navigator.pushNamed(context, loginRoute);
                        },
                        style: ElevatedButton.styleFrom(
                            minimumSize: Size(80.0, 80.0)),
                        child: Text('Connectez-vous',
                            style: new TextStyle(fontSize: 26.0)),
                      )]),
                      Container(
                        height: 50.0,
                        width: 300.0,
                        child: ElevatedButton(
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
                              AwesomeDialog(
                                context: navigatorKey.currentContext as BuildContext,
                                width: 800,
                                dismissOnTouchOutside: false,
                                dialogType: DialogType.WARNING,
                                animType: AnimType.BOTTOMSLIDE,
                                title: 'Attention!',
                                desc: 'Êtes-vous certain de vouloir créer ce compte?.',
                                btnCancelOnPress: () {
                                  Navigator.pop(context);
                                },
                                btnOkOnPress: () {
                                  registerNewUser(_image);
                                },
                              ).show();
                            }
                          },
                          style: ElevatedButton.styleFrom(
                              minimumSize: Size(80.0, 80.0)),
                          child: Text('Créer le compte',
                              style: new TextStyle(fontSize: 30.0)),
                        ),
                      ),
                    ]),
                  ],
                )),
              ),
            ]));
  }

  formField(String hintText, TextEditingController textController) {
    return TextFormField(
      controller: textController,
      obscureText: hintText == 'Mot de Passe*' && !_passwordVisible,
      enableSuggestions: hintText != 'Mot de Passe*',
      style: const TextStyle(fontSize: _fontSize),
      keyboardType: hintText == 'Nombre de membres maximum'
          ? TextInputType.number
          : TextInputType.text,
      maxLines: 1,
      autofocus: false,
      decoration: InputDecoration(
          errorStyle: const TextStyle(fontSize: _fontSize),
          hintText: hintText,
          helperText: hintText == 'Mot de Passe*'
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
          suffixIcon: hintText != 'Mot de Passe*'
              ? null
              : IconButton(
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
        if (textController == emailController) {
          if (!RegExp(
                  r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+")
              .hasMatch(value!)) {
            return 'Le courriel est invalide';
          }
        } else if (textController == passController) {
          // alphanumeric
          if (value!.length < 4) {
            return 'Le mot de passe doit avoir 4 caractères au minimum';
          } else if (!regExp.hasMatch(value)) {
            return 'Votre mot de passe ne peut pas contenir de symbole!';
          }
        } else if (textController == usernameController) {
          if (!regExp.hasMatch(value!)) {
            return "Le nom d'utilisateur est invalide";
          }
        } else if (value == null || value.isEmpty) {
          return 'Veuillez remplir cette option svp.';
        }
        _formKey.currentState!.save();
        return null;
      },
    );
  }

  openAvatarDialog() {
    return TextButton(
        onPressed: () {
          fetchAvatars();
          showDialog(
              context: context,
              builder: (BuildContext context) {
                return AlertDialog(
                    title: Text("Choisir un avatar"),
                    content: Row(children: [
                      chooseFromListDialog(),
                      const SizedBox(width: 20),
                      takePicture(),
                    ]));
              });
        },
        child: const Text("Choisir un avatar"));
  }

  chooseFromListDialog() {
    return ElevatedButton(
        onPressed: () {
          isFromAvatarList = true;
          showDialog(
              barrierDismissible: false,
              context: context,
              builder: (BuildContext context) {
                return listAlert();
              });
        },
        child: Text("Choisir d'une liste"));
  }

  listAlert() {
    return AlertDialog(
        titlePadding: EdgeInsets.zero,
        title: Container(
            color: kContentColor,
            child: Center(child: Text("Choisir un avatar"))),
        content: Container(
            width: 700,
            height: 700,
            child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  childAspectRatio: 1,
                  crossAxisCount: 3,
                  mainAxisSpacing: 20,
                  crossAxisSpacing: 25,
                ),
                itemCount: avatars.length,
                itemBuilder: (BuildContext context, int index) {
                  return GestureDetector(
                    child: Container(
                        decoration: currentlySelectedIndex != null && currentlySelectedIndex == index? BoxDecoration(
                            border: Border.all(width: 5, color: kPrimaryColor)) : BoxDecoration(
                            border: Border.all(width: 0, color: Colors.black)) ,
                        child: Card(
                          elevation: 10,
                          shape: const RoundedRectangleBorder(
                              borderRadius:
                              BorderRadius.all(Radius.circular(30.0))),
                          color: kContentColor2,
                          child: FittedBox(
                              fit: BoxFit.fill,
                              child: Image.network(avatars[index])),
                        )),
                    onTap: () {
                      currentlySelectedIndex = index;
                    },
                  );
                })),
        actions: [
          ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                currentlySelectedIndex = null;
              },
              child: Text('Annuler')),
          const SizedBox(width: 10),
          ElevatedButton(
              onPressed: () {
                // TODO : set url here
                if(currentlySelectedIndex != null){
                  setState(() {
                    currentAvatar = avatars[currentlySelectedIndex as int];
                  });
                }
                currentlySelectedIndex = null;
                isPicture = false;
                Navigator.pop(context);
                Navigator.pop(context);
              },
              child: Text('Choisir'))
        ]);
  }

  takePicture() {
    return ElevatedButton(
        onPressed: () async {
          isFromAvatarList = false;
          isPicture = true;
          final ImagePicker _picker = ImagePicker();
          final XFile? photo = await _picker.pickImage(source: ImageSource.camera);
          File file = File( photo!.path );
          setState(() {
            _image = file;
          });
          Navigator.pop(context);
        },
        child: Text("Prendre une phto"));
  }

  fetchAvatars() async {
    var url = Uri.http(dotenv.env['SERVER_URL'] ?? "", '/api/public/avatars');
    var response = await http.get(url);
    if (response.statusCode == 200) {
      var jsonResponse = json.decode(response.body) as Map<String, dynamic>;
      print('Fetch Avatars');
      setState(() {
        avatars = jsonResponse['avatars'];
      });
    } else {
      setState(() {
        avatars = [];
      });
      print('Request failed with status: ${response.body}.');
    }
  }

  Future<void> registerNewUser(File? file) async {
    Dio dio = Dio();
    dio.options.headers['Content-Type'] = 'multipart/form-data';
    dio.options.baseUrl = 'https://' + (dotenv.env['SERVER_URL'] ?? "");
    FormData formData = FormData();

    if(file != null) {
      print('here');
      String fileName = file.path.split('/').last;
      formData = FormData.fromMap({
        "avatar": await MultipartFile.fromFile(file.path, filename:fileName),
        "email": emailController.text,
        "password": passController.text,
        "username": usernameController.text,
        "first_name": firstNameController.text,
        "last_name": lastNameController.text,
      });
    } else {
      print(currentAvatar);
      formData = FormData.fromMap({
        "avatar_url": currentAvatar,
        "email": emailController.text,
        "password": passController.text,
        "username": usernameController.text,
        "first_name": firstNameController.text,
        "last_name": lastNameController.text,
      });
    }

    var response = await dio.post("/auth/register", data: formData);
    print(response.data);
    if(response.statusCode == 201) {
      AwesomeDialog(
        context:
        navigatorKey.currentContext as BuildContext,
        width: 800,
        dismissOnTouchOutside: false,
        dialogType: DialogType.SUCCES,
        animType: AnimType.BOTTOMSLIDE,
        title: 'Succès!',
        desc: 'Votre compe à été créé! 😄',
        btnOkOnPress: () {
          Navigator.pushReplacementNamed(context, loginRoute);
        },
      ).show();
    } else {
      AwesomeDialog(
        context:
        navigatorKey.currentContext as BuildContext,
        width: 800,
        btnOkColor: Colors.red,
        dismissOnTouchOutside: false,
        dialogType: DialogType.ERROR,
        animType: AnimType.BOTTOMSLIDE,
        title: 'Erreur!',
        desc: response.data['message'],
        btnOkOnPress: () {},
      ).show();
    }
  }
}
