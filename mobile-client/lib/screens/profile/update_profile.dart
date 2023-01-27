import 'dart:convert';

import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/providers/collaborator.dart';
import 'package:Colorimage/utils/rest/rest_api.dart';
import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/src/provider.dart';
import 'dart:io';
import 'dart:async';

import '../../app.dart';

class UpdateProfile extends StatefulWidget {
  final User _user;

  UpdateProfile(this._user);

  @override
  _UpdateProfileScreenState createState() => _UpdateProfileScreenState(_user);
}

class _UpdateProfileScreenState extends State<UpdateProfile> {
  List avatars = [];
  bool isAuthor = false;
  User _user;
  TextEditingController userController = TextEditingController();
  TextEditingController passController = TextEditingController();

  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  static const _fontSize = 20.0;
  static const padding = 30.0;
  bool _passwordVisible = false;
  String currentAvatar = '';
  bool isFromAvatarList = true;
  File? _image;
  bool isPicture = false;
  int? currentlySelectedIndex;

  _UpdateProfileScreenState(this._user);

  @override
  void initState() {
    super.initState();
    _passwordVisible = false;
    currentAvatar = _user.photoURL as String;
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
                update(_image, userController.text);
                userController.clear();
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

  update(File? file, username) async {
    Dio dio = Dio();
    dio.options.headers['Content-Type'] = 'multipart/form-data';
    dio.options.baseUrl = 'https://' + (dotenv.env['SERVER_URL'] ?? "");
    FormData formData = FormData();

    if (file != null) {
      print('here');
      String fileName = file.path.split('/').last;
      formData = FormData.fromMap({
        "avatar": await MultipartFile.fromFile(file.path, filename: fileName),
        "username": userController.text,
      });
    } else {
      print(currentAvatar);
      formData = FormData.fromMap({
        "avatar_url": currentAvatar,
        "username": userController.text,
      });
    }
    var response = await dio.post("/api/users/profile", data: formData);
    print(response.data);
    if (response.statusCode == 201) {
      AwesomeDialog(
        context: navigatorKey.currentContext as BuildContext,
        width: 800,
        dismissOnTouchOutside: false,
        dialogType: DialogType.SUCCES,
        animType: AnimType.BOTTOMSLIDE,
        title: 'Succès!',
        desc: 'Vous avez mis a jour! 😄',
        btnOkOnPress: () {
          Navigator.pop(context);
        },
      ).show();
    } else {
      AwesomeDialog(
        context: navigatorKey.currentContext as BuildContext,
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

  profileRow() {
    return Row(mainAxisAlignment: MainAxisAlignment.center, children: [
      Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        CircleAvatar(
          backgroundColor: Colors.white,
          radius: 85.0,
          child: CircleAvatar(
            backgroundImage: isPicture
                ? Image.file(_image!).image
                : NetworkImage(currentAvatar),
            radius: 80.0,
          ),
        ),
        const SizedBox(height: 20),
        openAvatarDialog(),
        const SizedBox(height: 20),
        Container(
            width: 500,
            child: TextFormField(
              style: const TextStyle(fontSize: _fontSize),
              controller: userController,
              maxLines: 1,
              autofocus: false,
              decoration: InputDecoration(
                labelText: 'Pseudonyme',
                labelStyle: const TextStyle(
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
              autovalidateMode: AutovalidateMode.always,
            )),
        const SizedBox(height: 20),
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
    return TextButton(
        onPressed: () {
          fetchAvatars();
          showDialog(
              context: context,
              builder: (BuildContext context) {
                return AlertDialog(
                    title: Text("Changer d'avatar"),
                    content: Row(children: [
                      chooseFromListDialog(),
                      const SizedBox(width: 20),
                      takePicture(),
                    ]));
              });
        },
        child: const Text("Changer d'avatar"));
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
                        decoration: currentlySelectedIndex != null &&
                                currentlySelectedIndex == index
                            ? BoxDecoration(
                                border:
                                    Border.all(width: 5, color: kPrimaryColor))
                            : BoxDecoration(
                                border:
                                    Border.all(width: 0, color: Colors.black)),
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
                if (currentlySelectedIndex != null) {
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
          final XFile? photo =
              await _picker.pickImage(source: ImageSource.camera);
          File file = File(photo!.path);
          setState(() {
            _image = file;
          });
          Navigator.pop(context);
        },
        child: Text("Prendre une phto"));
  }

  fetchAvatars() async {
    RestApi rest = RestApi();
    var response = await rest.user.fetchAvailableAvatars(_user);
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
}
