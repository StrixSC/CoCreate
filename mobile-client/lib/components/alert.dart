import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

void showSnackBarAsBottomSheet(BuildContext context, String message) {
  showModalBottomSheet<void>(
    context: context,
    barrierColor: const Color.fromRGBO(0, 0, 0, 0),
    builder: (BuildContext context) {
      Future.delayed(const Duration(seconds: 5), () {
        try {
          Navigator.pop(context);
        } on Exception {}
      });
      return Container(
          color: Colors.grey.shade800,
          padding: const EdgeInsets.all(20),
          child: Wrap(children: [
            Text(
              message,
              style: TextStyle(color: Colors.white),
            )
          ]));
    },
  );
}
