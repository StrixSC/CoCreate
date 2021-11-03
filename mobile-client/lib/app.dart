import 'package:Colorimage/screens/login/register.dart';
import 'package:flutter/material.dart';
import 'screens/login/login.dart';
import 'package:provider/provider.dart';
import 'screens/home/home.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'screens/drawing/drawing.dart';

const loginRoute = '/';
const chatRoute = '/chat';
const homeRoute = '/home';
const drawingRoute = '/drawing';
const registerRoute = '/register';
const fontsize = TextStyle(fontSize: 25);

class App extends StatelessWidget {
  const App({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
        designSize: const Size(1200, 1920),
        builder: () => Provider<String>(
              create: (context) => 'Flutter Dev',
              child: MaterialApp(
                onGenerateRoute: _routes(),
                theme: ThemeData(
                  primarySwatch: Colors.blue,
                  textTheme: Theme.of(context).textTheme.apply(
                        fontSizeFactor: 1.5,
                        fontSizeDelta: 2.0,
                      ),
                ), //_theme(),
              ),
            ));
  }

  RouteFactory _routes() {
    return (settings) {
      Widget screen;
      switch (settings.name) {
        case loginRoute:
          screen = const Login();
          break;
        case registerRoute:
          screen = const Register();
          break;
        case homeRoute:
          final arguments = settings.arguments as Map<String, dynamic>;
          screen = Home(arguments['user']);
          break;
        case drawingRoute:
          final arguments = settings.arguments as Map<String, dynamic>;
          screen = DrawingScreen(arguments['socket']);
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
