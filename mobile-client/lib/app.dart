import 'package:flutter/material.dart';
import 'package:Colorimage/style.dart';
import 'screens/login/login.dart';
import 'screens/chat/chat.dart';
import 'screens/home/home.dart';
import 'style.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

const LoginRoute = '/';
const ChatRoute = '/chat';
const HomeRoute = '/home';


class App extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
        designSize: Size(1200, 1920),
        builder: () => MaterialApp(
          onGenerateRoute: _routes(),
          theme: ThemeData(primarySwatch: Colors.blue, textTheme: TextTheme(button: TextStyle(fontSize: 45.sp)
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
          screen = Login();
          break;
        case ChatRoute:
          // final arguments = settings.arguments as Map<String, dynamic>;
          screen = ChatScreen();
          break;
        case HomeRoute:
          // final arguments = settings.arguments as Map<String, dynamic>;
          screen = Home();
          break;
        default:
          screen = Login();
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
