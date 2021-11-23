// main.dart

import 'package:Colorimage/providers/collaborator.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'app.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'providers/messenger.dart';
import 'models/user.dart';

Future main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: "assets/.env");
  runApp(MultiProvider(
    providers: [
      ChangeNotifierProvider(create: (_) => Messenger(null, [], [])),
      ChangeNotifierProvider(create: (_) => Collaborator(null))
    ],
    builder: (context, child) {
      return App();
    },
  ));
}
