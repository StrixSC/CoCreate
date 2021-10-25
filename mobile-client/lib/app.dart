import 'package:flutter/material.dart';
import 'package:Colorimage/style.dart';
import 'screens/login/login.dart';
import 'screens/chat/chat.dart';
import 'screens/home/home.dart';
import 'style.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'screens/drawing/drawing.dart';

const LoginRoute = '/';
const ChatRoute = '/chat';
const HomeRoute = '/home';
const drawingRoute = '/drawing';
const fontsize = TextStyle(fontSize: 25);

class App extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
        designSize: const Size(1200, 1920),
        builder: () => MaterialApp(
          onGenerateRoute: _routes(),
          theme: ThemeData(primarySwatch: Colors.blue,
            textTheme:Theme.of(context).textTheme.apply(
              fontSizeFactor: 1.5,
              fontSizeDelta: 2.0,
            ),
          ),//_theme(),
        ),
    );
  }

  RouteFactory _routes() {
    return (settings) {
      Widget screen;
      switch (settings.name) {
        case LoginRoute:
          screen = const Login();
          break;
        case HomeRoute:
          final arguments = settings.arguments as Map<String, dynamic>;
          screen = Home(arguments['username']);
          break;
        case drawingRoute:
          screen = const DrawingScreen();
          break;
        default:
          screen = const Login();
      }
      return MaterialPageRoute(builder: (BuildContext context) => screen);
    };
  }
  // ThemeData _theme() {
  //   return ThemeData(
  //     appBarTheme:
  //     AppBarTheme(textTheme: TextTheme(headline6: AppBarTextStyle)),
  //   );
  // }

}
