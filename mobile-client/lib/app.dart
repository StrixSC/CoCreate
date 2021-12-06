import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/screens/login/kickout.dart';
import 'package:Colorimage/screens/login/register.dart';
import 'package:Colorimage/utils/general.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
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
const kickedOutRoute = '/kickout';
const fontsize = TextStyle(fontSize: 25);

final navigatorKey = GlobalKey<NavigatorState>();

class App extends StatefulWidget {
  const App({Key? key}) : super(key: key);

  @override
  _AppState createState() => _AppState();
}

class _AppState extends State<App> with TickerProviderStateMixin {
  late AnimationController controller;
  final Future<FirebaseApp> _initialization = Firebase.initializeApp();

  @override
  void initState() {
    controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 5),
    )..addListener(() {
        setState(() {});
      });
    controller.repeat();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      // Initialize FlutterFire:
      future: _initialization,
      builder: (context, snapshot) {
        // Check for errors
        if (snapshot.hasError) {
          print("There was an error while initializing FlutterFire: " +
              snapshot.toString());
        }

        // Once complete, show your application
        if (snapshot.connectionState == ConnectionState.done) {
          return App();
        }

        // Otherwise, show something whilst waiting for initialization to complete
        return CircularProgressIndicator(
          value: controller.value,
          semanticsLabel: 'Linear progress indicator',
        );
      },
    );
  }

  App() {
    return ScreenUtilInit(
      designSize: const Size(1200, 1920),
      builder: () => Provider<String>(
        create: (context) => 'Flutter Dev',
        child: MaterialApp(
          onGenerateRoute: _routes(),
          theme: ThemeData(
              primarySwatch: createMaterialColor(kPrimaryColor),
              accentColor: kPrimaryColor2,
              canvasColor: kContentColor2,
              scaffoldBackgroundColor: kContentColor2,
              primaryColor: kPrimaryColor,
              primaryColorDark: kPrimaryColor,
              brightness: Brightness.dark,
              inputDecorationTheme: const InputDecorationTheme(
                filled: true,
                fillColor: kContentColor4,
                  labelStyle: TextStyle(color: kPrimaryColor),),
              textTheme: GoogleFonts.ralewayTextTheme(
                  Theme.of(context).textTheme.apply(
                    displayColor: Colors.white,
                        bodyColor: Colors.white,
                        fontSizeFactor: 2.0,
                        fontSizeDelta: 2.0,
                      ))),
          navigatorKey: navigatorKey,
        ), //_theme(),
      ),
    );
  }

  RouteFactory _routes() {
    return (settings) {
      Widget screen;
      switch (settings.name) {
        case kickedOutRoute:
          screen = Kickout();
          break;
        case loginRoute:
          screen = const Login();
          break;
        case registerRoute:
          screen = const Register();
          break;
        case homeRoute:
          screen = Home();
          break;
        case drawingRoute:
          final arguments = settings.arguments as Map<String, dynamic>;
          screen = DrawingScreen(arguments['socket'] , arguments['user'], arguments['collaborationId'], arguments['actions']);
          break;
        default:
          return null;
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
