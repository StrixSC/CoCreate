import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/material.dart';
import '../../app.dart';

class SocketService {
  User user;
  IO.Socket socket;
  final String url =
      'https://' + (dotenv.env['SERVER_URL'] ?? "localhost:5000");
  bool isShowingAlert = false;

  SocketService(this.user, this.socket) {
    onError();
    socket.connect();
    // onConnect();
    socket.on('disconnect', (_) => print('disconnect'));
  }

  // Change to ERROR codes with server
  onError() {
    socket.on('error', (err) {
      print('Socket error: ');
      print(err.toString());
      if (isShowingAlert == false) {
        isShowingAlert = true;
        errorDialog(err);
      }
    });
    socket.on('exception', (err) {
      print('exception');
      print(err);
      if (isShowingAlert == false) {
        isShowingAlert = true;
        errorDialog(err);
      }
    });
    socket.on('collaboration:exception', (err) {
      print('gallerie:exception');
      print(err);
      if (isShowingAlert == false) {
        isShowingAlert = true;
        errorDialog(err);
      }
    });
    socket.on('channel:exception', (err) {
      print('channel:exception');
      print(err);
      if (isShowingAlert == false) {
        isShowingAlert = true;
        errorDialog(err);
      }
    });
    socket.on('channel:exception', (err) {
      print('teams:exception');
      print(err);
      if (isShowingAlert == false) {
        isShowingAlert = true;
        errorDialog(err);
      }
    });
  }

  errorDialog(error) {
    // TODO: don't delete this example for now
    AwesomeDialog(
      context: navigatorKey.currentContext as BuildContext,
      width: 800,
      btnOkColor: Colors.red,
      dismissOnTouchOutside: false,
      dialogType: DialogType.ERROR,
      animType: AnimType.BOTTOMSLIDE,
      title: 'Erreur!',
      desc: error['message'] == null
          ? 'Oops.. il y a eu une erreur quelque part...'
          : error['message'].toString(),
      btnOkOnPress: () {
        isShowingAlert = false;
      },
    ).show();
  }

  // onConnect() {
  //   socket.on('connect', (_) {
  //     print("connected to socket");
  //   });
  // }
}
