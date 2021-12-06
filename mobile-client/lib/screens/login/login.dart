import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/providers/collaborator.dart';
import 'package:Colorimage/providers/messenger.dart';
import 'package:Colorimage/providers/team.dart';
import 'package:Colorimage/utils/rest/rest_api.dart';
import 'package:Colorimage/utils/socket/channel.dart';
import 'package:Colorimage/utils/socket/collaboration.dart';
import 'package:Colorimage/utils/socket/socket_service.dart';
import 'package:Colorimage/utils/socket/team.dart';
import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:provider/src/provider.dart';
import 'package:translator/translator.dart';
import '../../app.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

TextEditingController userController = TextEditingController();
TextEditingController passController = TextEditingController();
TextEditingController emailController = TextEditingController();
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
  final GlobalKey<FormState> _formKeyForgotPass = GlobalKey<FormState>();

  String errorMessage = "";
  final translator = GoogleTranslator();
  late UserCredential userCredential;
  bool _passwordVisible = false;

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: [
      'email',
      'https://www.googleapis.com/auth/contacts.readonly',
    ],
  );

  @override
  void initState() {
    super.initState();
    // isAlreadySignedIn();
  }

  // isAlreadySignedIn() async {
  //   if (FirebaseAuth.instance.currentUser != null) {
  //     Navigator.pushReplacementNamed(context, homeRoute);
  //   }
  // }

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
          .signInWithEmailAndPassword(
              email: "Pritam184@hotmail.com", password: "pripri123");
    } on FirebaseAuthException catch (e) {
      await translator
          .translate(e.message!, from: 'en', to: 'fr')
          .then((value) => errorMessage = value.text);
      setState(() {
        errorMessage;
      });
      return;
    }

    var token = await FirebaseAuth.instance.currentUser!.getIdToken();

    initializeSocketConnection(userCredential, token);

    // Fetch initial user info
    context.read<Messenger>().updateUser(userCredential);
    context.read<Collaborator>().updateUser(userCredential);
    context.read<Teammate>().updateUser(userCredential);
    context.read<Messenger>().fetchChannels();
    context.read<Messenger>().fetchAllChannels();

    // Home Page
    Navigator.pushReplacementNamed(context, homeRoute);
  }

  void initializeSocketConnection(auth, token) {
    IO.Socket socket = IO.io(
        'https://' + (dotenv.env['SERVER_URL'] ?? "localhost:5000"),
        IO.OptionBuilder()
            .setExtraHeaders({'Authorization': 'Bearer ' + token})
            .disableAutoConnect()
            .setTransports(['websocket']) // for Flutter or Dart VM
            .build());

    SocketService socketService = SocketService(auth.user, socket);
    CollaborationSocket collaborationSocket =
        CollaborationSocket(user: auth.user, socket: socketService.socket);
    ChannelSocket channelSocket =
        ChannelSocket(user: auth.user, socket: socketService.socket);
    TeamSocket teamSocket =
        TeamSocket(user: auth.user, socket: socketService.socket);
    context.read<Messenger>().setSocket(channelSocket);
    context.read<Teammate>().setSocket(teamSocket);
    context.read<Collaborator>().setSocket(collaborationSocket);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: null,
        body: Center(
            child: Container(
                width: 800,
                child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Colorimage',
                          style: TextStyle(
                            fontFamily: GoogleFonts.yellowtail().fontFamily,
                            fontWeight: FontWeight.w200,
                            fontSize: 100.0,
                            color: Colors.white,
                          )),
                      Form(
                        key: _formKey,
                        child: Flexible(
                          child: ListView(
                            shrinkWrap: true,
                            padding: EdgeInsets.only(left: 100.0, right: 100.0),
                            children: <Widget>[
                              errorMessage.isNotEmpty
                                  ? Padding(
                                      padding: const EdgeInsets.fromLTRB(
                                          30, 20, 0, 0),
                                      child: Text(errorMessage,
                                          style: const TextStyle(
                                              color: Colors.red,
                                              fontSize: 25.0)))
                                  : const SizedBox.shrink(),
                              SizedBox(height: 24.0),
                              TextFormField(
                                style: const TextStyle(fontSize: _fontSize),
                                controller: userController,
                                maxLines: 1,
                                autofocus: false,
                                decoration: InputDecoration(
                                  errorStyle:
                                      const TextStyle(fontSize: _fontSize),
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
                                  padding: EdgeInsets.fromLTRB(0, 30, 0, 0),
                                  child: TextFormField(
                                    style: const TextStyle(fontSize: _fontSize),
                                    controller: passController,
                                    maxLines: 1,
                                    autofocus: false,
                                    obscureText: !_passwordVisible,
                                    decoration: InputDecoration(
                                        errorStyle: const TextStyle(
                                            fontSize: _fontSize),
                                        hintText: "Mot de passe",
                                        hintStyle: const TextStyle(
                                          fontSize: _fontSize,
                                        ),
                                        contentPadding:
                                            const EdgeInsets.all(padding),
                                        border: OutlineInputBorder(
                                            borderRadius:
                                                BorderRadius.circular(3.0)),
                                        suffixIcon: IconButton(
                                            icon: Icon(
                                              // Based on passwordVisible state choose the icon
                                              _passwordVisible
                                                  ? Icons.visibility
                                                  : Icons.visibility_off,
                                              color: Theme.of(context)
                                                  .primaryColorDark,
                                            ),
                                            onPressed: () {
                                              // Update the state i.e. toogle the state of passwordVisible variable
                                              setState(() {
                                                _passwordVisible =
                                                    !_passwordVisible;
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
                                    login(userController.text,
                                        passController.text);
                                    // }
                                  }
                                },
                                style: ElevatedButton.styleFrom(
                                    minimumSize: Size(80.0, 80.0)),
                                child: Text('Se connecter',
                                    style: new TextStyle(fontSize: 26.0)),
                              ),
                              Padding(
                                  padding: EdgeInsets.fromLTRB(0, 30, 0, 0),
                                  child: ElevatedButton(
                                    onPressed: () {
                                      _handleGoogleSign();
                                    },
                                    style: ElevatedButton.styleFrom(
                                        minimumSize: Size(80.0, 80.0)),
                                    child: Text('Se connecter avec Google',
                                        style: new TextStyle(fontSize: 26.0)),
                                  )),
                              Padding(
                                  padding: EdgeInsets.fromLTRB(0, 15, 0, 0),
                                  child: Row(children: [
                                    Text('Pas de compte? ',
                                        style: new TextStyle(fontSize: 26.0)),
                                    TextButton(
                                      onPressed: () {
                                        // Validate will return true if the form is valid, or false if
                                        Navigator.pushNamed(
                                            context, registerRoute);
                                      },
                                      style: ElevatedButton.styleFrom(
                                          minimumSize: Size(30.0, 30.0)),
                                      child: Text('Inscrivez-vous',
                                          style: new TextStyle(fontSize: 26.0)),
                                    )
                                  ])),
                              Padding(
                                  padding: EdgeInsets.fromLTRB(0, 0, 0, 0),
                                  child: Row(children: [
                                    Text('Mot de passe oublié? ',
                                        style: new TextStyle(fontSize: 26.0)),
                                    TextButton(
                                      onPressed: () {
                                        forgotDialog();
                                      },
                                      style: ElevatedButton.styleFrom(
                                          minimumSize: Size(10.0, 10.0)),
                                      child: Text('Récupérer',
                                          style: new TextStyle(fontSize: 26.0)),
                                    )
                                  ])),
                            ],
                          ),
                        ),
                      )
                    ]))));
  }

  forgotDialog() async {
    showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
              titlePadding: EdgeInsets.zero,
              title: Container(
                  padding: EdgeInsets.all(10.0),
                  color: kContentColor,
                  child: const Center(child: Text('Récupération de mot de passe'))),
              content: SingleChildScrollView(child: forgot()),
              actions: <Widget>[
                Padding(
                    padding: EdgeInsets.fromLTRB(0, 0, 25.0, 20.0),
                    child: Container(
                        height: 50,
                        child: ElevatedButton(
                          onPressed: () async {
                            await FirebaseAuth.instance
                                .sendPasswordResetEmail(
                                    email: emailController.text)
                                .whenComplete(() => AwesomeDialog(
                                      context: navigatorKey.currentContext
                                          as BuildContext,
                                      width: 800,
                                      dismissOnTouchOutside: false,
                                      dialogType: DialogType.SUCCES,
                                      animType: AnimType.BOTTOMSLIDE,
                                      title: 'Récupération envoyé!',
                                      desc: 'Allez voir dans votre courriel! 😄',
                                      btnOkOnPress: () {
                                        Navigator.pushReplacementNamed(
                                            context, loginRoute);
                                      },
                                    ).show());
                          },
                          child: const Text('Récupérer'),
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
                          width: 800,
                          child: Text("Ne vous inquiétez pas! Vous pouvez le ré-obtenir 😎", style: TextStyle(fontSize: 25.0)),
                        ),
                        SizedBox(
                          height: 30,
                        ),
                        SizedBox(
                          width: 800,
                          child: formField("Courriel", emailController),
                        ),
                      ])),
            ])));
  }

  formField(String hintText, TextEditingController textController) {
    return TextFormField(
      controller: textController,
      style: const TextStyle(fontSize: _fontSize),
      maxLines: 1,
      autofocus: false,
      decoration: InputDecoration(
          errorStyle: const TextStyle(fontSize: _fontSize),
          hintText: hintText,
          helperText:
              "Si votre courriel est valide, vous devrez recevoir un courriel \n pour changer de mot de passe",
          helperStyle: TextStyle(fontSize: 15.0),
          hintStyle: const TextStyle(
            fontSize: _fontSize,
          ),
          contentPadding: const EdgeInsets.all(padding),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(3.0))),
      validator: (value) {
        RegExp regExp = RegExp(r'^[a-zA-Z0-9]+$');
        if (textController == emailController) {
          if (!RegExp(
                  r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+")
              .hasMatch(value!)) {
            return 'Le courriel est invalide';
          }
        } else if (value == null || value.isEmpty) {
          return 'Veuillez entrez un courriel svp.';
        }
        _formKey.currentState!.save();
        return null;
      },
    );
  }

  Future<void> _handleGoogleSign() async {
    try {
      await _googleSignIn.signIn().whenComplete(() => Navigator.pushReplacementNamed(context, homeRoute));
    } catch (error) {
      AwesomeDialog(
        context:
        navigatorKey.currentContext as BuildContext,
        width: 800,
        btnOkColor: Colors.red,
        dismissOnTouchOutside: false,
        dialogType: DialogType.ERROR,
        animType: AnimType.BOTTOMSLIDE,
        title: 'Erreur!',
        desc: error.toString(),
        btnOkOnPress: () {},
      ).show();
      print(error);
    }
  }
}
