import 'dart:ui';

import 'package:flutter/material.dart';

class DrawingScreen extends StatefulWidget {
  const DrawingScreen({Key? key});

  @override
  State<DrawingScreen> createState() => _DrawingScreenState();
}

class _DrawingScreenState extends State<DrawingScreen> {
  List<Offset> offsets = <Offset>[];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: GestureDetector(
        onPanStart: (details) {
          setState(() {
            offsets.add(details.localPosition);
          });
        },
        onPanUpdate: (details) {
          setState(() {
            offsets.add(details.localPosition);
          });
        },
        onPanEnd: (details) {
          setState(() {
            offsets.add(Offset.zero);
          });
        },
        child: Center(
          child: CustomPaint(
            painter: Painter(offsets),
            child: SizedBox(
              height: MediaQuery
                  .of(context)
                  .size
                  .height,
              width: MediaQuery
                  .of(context)
                  .size
                  .width,
            ),
          ),
        ),
      ),
    );
  }
}

class Painter extends CustomPainter {
  Painter(this.offsets);

  List<Offset> offsets;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.blueAccent
      ..isAntiAlias = true
      ..strokeWidth = 3.0;

    for (var i = 0; i < offsets.length - 1; i++) {
      if (offsets[i] != Offset.zero && offsets[i + 1] != Offset.zero) {
        canvas.drawLine(offsets[i], offsets[i + 1], paint);
      } else {
        canvas.drawPoints(PointMode.points, [offsets[i]], paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
