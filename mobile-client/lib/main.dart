import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'app.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'models/messenger.dart';
import 'models/user.dart';

Future main() async {
  await dotenv.load(fileName: "assets/.env");
  runApp(MultiProvider(
    providers: [
      ChangeNotifierProvider(create: (_) => Messenger(User(), [], []))
    ],
    builder: (context, child) {
      return App();
    },
  ));
}
