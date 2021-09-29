import 'package:flutter/material.dart';
import 'package:flutter_application_1/style.dart';
import 'screens/login/login.dart';
import 'screens/chat/chat.dart';
import 'style.dart';

const LoginRoute = '/';
const ChatRoute = '/chat';

class App extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      onGenerateRoute: _routes(),
      theme: _theme(),
    );
  }

  RouteFactory _routes() {
    return (settings) {
      Widget screen;
      switch (settings.name) {
        case LoginRoute:
          screen = Login();
          break;
        case ChatRoute:
          final arguments = settings.arguments as Map<String, dynamic>;
          screen = ChatScreen(arguments['username'], arguments['ipAddress']);
          break;
        default:
          return null;
      }
      return MaterialPageRoute(builder: (BuildContext context) => screen);
    };
  }

  ThemeData _theme() {
    return ThemeData(
      appBarTheme:
          AppBarTheme(textTheme: TextTheme(headline6: AppBarTextStyle)),
    );
  }
}
