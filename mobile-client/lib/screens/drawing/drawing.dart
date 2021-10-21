import 'dart:ui';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';

class DrawingScreen extends StatefulWidget {
  const DrawingScreen({Key? key});

  @override
  State<DrawingScreen> createState() => _DrawingScreenState();
}

class _DrawingScreenState extends State<DrawingScreen> {
  List<Offset> offsets = <Offset>[];
  List<Paint> paintList = <Paint>[];
  Path path = Path()..fillType = PathFillType.nonZero;
  Offset endPoint = const Offset(-1, -1);
  String drawType = "line";

  // create some values
  Color pickerColor = const Color(0xff443a49);
  Color currentColor = const Color(0xff443a49);

// ValueChanged<Color> callback
  void changeColor(Color color) {
    setState(() => currentColor = color);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(actions: <Widget>[
        Padding(
          padding: const EdgeInsets.only(right: 20.0),
          child: RaisedButton(
            elevation: 3.0,
            onPressed: () {
              showDialog(
                context: context,
                builder: (BuildContext context) {
                  return AlertDialog(
                    title: Text('Select a color'),
                    content: SingleChildScrollView(
                      child: BlockPicker(
                        pickerColor: currentColor,
                        onColorChanged: changeColor,
                      ),
                    ),
                  );
                },
              );
            },
            child: const Text('Colors'),
            color: currentColor,
            textColor: useWhiteForeground(currentColor)
                ? const Color(0xffffffff)
                : const Color(0xff000000),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(right: 20.0),
          child: GestureDetector(
            onTap: () {
              drawType = "line";
            },
            child: const Icon(
              CupertinoIcons.hand_draw_fill,
              size: 26.0,
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(right: 20.0),
          child: GestureDetector(
            onTap: () {
              drawType = "select";
            },
            child: const Icon(
              CupertinoIcons.hand_raised_fill,
              size: 26.0,
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(right: 20.0),
          child: GestureDetector(
            onTap: () {
              drawType = "cercle";
            },
            child: const Icon(
              CupertinoIcons.circle,
              size: 26.0,
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(right: 20.0),
          child: GestureDetector(
            onTap: () {
              drawType = "rect";
            },
            child: const Icon(
              CupertinoIcons.rectangle,
              size: 26.0,
            ),
          ),
        ),
      ]),
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
            offsets.add(endPoint);
          });
        },
        child: Center(
          child: CustomPaint(
            painter: Painter(offsets, path, drawType, currentColor, paintList),
            child: SizedBox(
              height: MediaQuery.of(context).size.height,
              width: MediaQuery.of(context).size.width,
            ),
          ),
        ),
      ),
    );
  }
}

class Painter extends CustomPainter {
  Painter(this.offsets, this.path, this.drawType, this.currentColor,
      this.paintList);
  List<Offset> offsets;
  List<Paint> paintList;
  Color currentColor;
  String drawType;
  Path path;
  Offset endPoint = const Offset(-1, -1);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = currentColor
      ..isAntiAlias = true
      ..strokeWidth = 6.0
      ..style = PaintingStyle.stroke;

    List<PathMetric> pathMetrics;

    pathMetrics = path.computeMetrics().toList();
    for (var i = 0; i < paintList.length; i++) {
      PathMetric pathMetric = pathMetrics.elementAt(i);
      canvas.drawPath(
          pathMetric.extractPath(0, pathMetric.length), paintList.elementAt(i));
    }

    if (drawType == "line") {
      for (var i = 0; i < offsets.length - 1; i++) {
        if (offsets[i] != endPoint && offsets[i + 1] != endPoint) {
          canvas.drawLine(offsets[i], offsets[i + 1], paint);
        } else if (offsets[i] != endPoint) {
          // canvas.drawPoints(PointMode.points, [offsets[i]], paint);
          offsets.removeLast();
          paintList.add(paint);
          path.moveTo(offsets.first.dx, offsets.first.dy);
          for (var offset in offsets) {
            path.lineTo(offset.dx, offset.dy);
          }
          offsets.clear();
        }
      }
    }

    if (drawType == "select") {
      pathMetrics.forEach((pathMetric) {
        path;
      });
      // if (path.contains(offsets.first) && !offsets.contains(endPoint)) {
      //   for (var i = 0; i < paintList.length; i++) {
      //     PathMetric pathMetric = pathMetrics.elementAt(i);
      //     Path pathElement = pathMetric.extractPath(0, pathMetric.length);
      //     if (pathElement.contains(offsets.first)) {
      //       Path dragPath = pathElement.shift(Offset(
      //           offsets.last.dx - offsets.first.dx,
      //           offsets.last.dy - offsets.first.dy));
      //       Paint paintCopy = paintList.elementAt(i);
      //       canvas.drawPath(dragPath, paintCopy);
      //     } else {
      //       canvas.drawPath(pathElement, paintList.elementAt(i));
      //     }
      //   }
      // } else {
      //   offsets.clear();
      // }
    }

    if (drawType == "cercle" || drawType == "rect") {
      if (offsets.last == endPoint) {
        offsets.removeLast();
        Rect rectOrElip = Rect.fromLTRB(offsets.first.dx, offsets.first.dy,
            offsets.last.dx, offsets.last.dy);
        if (drawType == "cercle") {
          paintList.add(paint);
          path.addOval(rectOrElip);
        } else {
          paintList.add(paint);
          path.addRect(rectOrElip);
        }
        offsets.clear();
      } else {
        Rect rectOrElip = Rect.fromLTRB(offsets.first.dx, offsets.first.dy,
            offsets.last.dx, offsets.last.dy);
        if (drawType == "cercle") {
          canvas.drawOval(rectOrElip, paint);
        } else {
          canvas.drawRect(rectOrElip, paint);
        }
      }
    }

    pathMetrics = path.computeMetrics().toList();
    for (var i = 0; i < paintList.length; i++) {
      PathMetric pathMetric = pathMetrics.elementAt(i);
      canvas.drawPath(
          pathMetric.extractPath(0, pathMetric.length), paintList.elementAt(i));
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
// import 'package:flutter/cupertino.dart' show CupertinoTextField;
// import 'package:flutter/material.dart';
// import 'package:flutter/services.dart';
//
// import 'package:flutter_colorpicker/flutter_colorpicker.dart';
//
// class DrawingScreen extends StatefulWidget {
//   @override
//   State<StatefulWidget> createState() => _DrawingScreen();
// }
//
// class _DrawingScreen extends State<DrawingScreen> {
//   bool lightTheme = true;
//   Color currentColor = Colors.limeAccent;
//   List<Color> currentColors = [Colors.limeAccent, Colors.green];
//
//   void changeColor(Color color) => setState(() => currentColor = color);
//   void changeColors(List<Color> colors) =>
//       setState(() => currentColors = colors);
//
//   @override
//   Widget build(BuildContext context) {
//     return Theme(
//       data: lightTheme ? ThemeData.light() : ThemeData.dark(),
//       child: DefaultTabController(
//         length: 3,
//         child: Scaffold(
//           appBar: AppBar(
//             title: GestureDetector(
//               child: Text('Flutter Color Picker Example'),
//               onDoubleTap: () => setState(() => lightTheme = !lightTheme),
//             ),
//             bottom: TabBar(
//               tabs: <Widget>[
//                 const Tab(text: 'HSV'),
//                 const Tab(text: 'Material'),
//                 const Tab(text: 'Block'),
//               ],
//             ),
//           ),
//           body: TabBarView(
//             physics: const NeverScrollableScrollPhysics(),
//             children: <Widget>[
//               Column(
//                 mainAxisAlignment: MainAxisAlignment.center,
//                 children: <Widget>[
//                   RaisedButton(
//                     elevation: 3.0,
//                     onPressed: () {
//                       showDialog(
//                         context: context,
//                         builder: (BuildContext context) {
//                           return AlertDialog(
//                             titlePadding: const EdgeInsets.all(0.0),
//                             contentPadding: const EdgeInsets.all(0.0),
//                             content: SingleChildScrollView(
//                               child: ColorPicker(
//                                 pickerColor: currentColor,
//                                 onColorChanged: changeColor,
//                                 colorPickerWidth: 300.0,
//                                 pickerAreaHeightPercent: 0.7,
//                                 enableAlpha: true,
//                                 displayThumbColor: true,
//                                 showLabel: true,
//                                 paletteType: PaletteType.hsv,
//                                 pickerAreaBorderRadius: const BorderRadius.only(
//                                   topLeft: const Radius.circular(2.0),
//                                   topRight: const Radius.circular(2.0),
//                                 ),
//                               ),
//                             ),
//                           );
//                         },
//                       );
//                     },
//                     child: const Text('Change me'),
//                     color: currentColor,
//                     textColor: useWhiteForeground(currentColor)
//                         ? const Color(0xffffffff)
//                         : const Color(0xff000000),
//                   ),
//                   RaisedButton(
//                     elevation: 3.0,
//                     onPressed: () {
//                       showDialog(
//                         context: context,
//                         builder: (BuildContext context) {
//                           return AlertDialog(
//                             titlePadding: const EdgeInsets.all(0.0),
//                             contentPadding: const EdgeInsets.all(0.0),
//                             shape: RoundedRectangleBorder(
//                               borderRadius: BorderRadius.circular(25.0),
//                             ),
//                             content: SingleChildScrollView(
//                               child: SlidePicker(
//                                 pickerColor: currentColor,
//                                 onColorChanged: changeColor,
//                                 paletteType: PaletteType.rgb,
//                                 enableAlpha: false,
//                                 displayThumbColor: true,
//                                 showLabel: false,
//                                 showIndicator: true,
//                                 indicatorBorderRadius:
//                                     const BorderRadius.vertical(
//                                   top: const Radius.circular(25.0),
//                                 ),
//                               ),
//                             ),
//                           );
//                         },
//                       );
//                     },
//                     child: const Text('Change me again'),
//                     color: currentColor,
//                     textColor: useWhiteForeground(currentColor)
//                         ? const Color(0xffffffff)
//                         : const Color(0xff000000),
//                   ),
//                   MaterialButton(
//                     elevation: 3.0,
//                     onPressed: () {
//                       // The initial value can be provided directly to the controller.
//                       final textController =
//                           TextEditingController(text: '#2F19DB');
//                       showDialog(
//                         context: context,
//                         builder: (BuildContext context) {
//                           return AlertDialog(
//                             scrollable: true,
//                             titlePadding: const EdgeInsets.all(0.0),
//                             contentPadding: const EdgeInsets.all(0.0),
//                             content: Column(
//                               children: [
//                                 ColorPicker(
//                                   pickerColor: currentColor,
//                                   onColorChanged: changeColor,
//                                   colorPickerWidth: 300.0,
//                                   pickerAreaHeightPercent: 0.7,
//                                   enableAlpha:
//                                       true, // hexInputController will respect it too.
//                                   displayThumbColor: true,
//                                   showLabel: true,
//                                   paletteType: PaletteType.hsv,
//                                   pickerAreaBorderRadius:
//                                       const BorderRadius.only(
//                                     topLeft: const Radius.circular(2.0),
//                                     topRight: const Radius.circular(2.0),
//                                   ),
//                                   hexInputController: textController, // <- here
//                                   portraitOnly: true,
//                                 ),
//                                 Padding(
//                                   padding: const EdgeInsets.all(16),
//                                   /* It can be any text field, for example:
//
//                                   * TextField
//                                   * TextFormField
//                                   * CupertinoTextField
//                                   * EditableText
//                                   * any text field from 3-rd party package
//                                   * your own text field
//
//                                   so basically anything that supports/uses
//                                   a TextEditingController for an editable text.
//                                   */
//                                   child: CupertinoTextField(
//                                     controller: textController,
//                                     // Everything below is purely optional.
//                                     prefix: Padding(
//                                       padding: const EdgeInsets.only(left: 8),
//                                       child: const Icon(Icons.tag),
//                                     ),
//                                   ),
//                                 )
//                               ],
//                             ),
//                           );
//                         },
//                       );
//                     },
//                     child: const Text('Change me via text input'),
//                     color: currentColor,
//                     textColor: useWhiteForeground(currentColor)
//                         ? const Color(0xffffffff)
//                         : const Color(0xff000000),
//                   ),
//                 ],
//               ),
//               Center(
//                 child: RaisedButton(
//                   elevation: 3.0,
//                   onPressed: () {
//                     showDialog(
//                       context: context,
//                       builder: (BuildContext context) {
//                         return AlertDialog(
//                           titlePadding: const EdgeInsets.all(0.0),
//                           contentPadding: const EdgeInsets.all(0.0),
//                           content: SingleChildScrollView(
//                             child: MaterialPicker(
//                               pickerColor: currentColor,
//                               onColorChanged: changeColor,
//                               enableLabel: true,
//                             ),
//                           ),
//                         );
//                       },
//                     );
//                   },
//                   child: const Text('Change me'),
//                   color: currentColor,
//                   textColor: useWhiteForeground(currentColor)
//                       ? const Color(0xffffffff)
//                       : const Color(0xff000000),
//                 ),
//               ),
//               Center(
//                 child: Column(
//                     mainAxisAlignment: MainAxisAlignment.center,
//                     children: <Widget>[
//                       RaisedButton(
//                         elevation: 3.0,
//                         onPressed: () {
//                           showDialog(
//                             context: context,
//                             builder: (BuildContext context) {
//                               return AlertDialog(
//                                 title: Text('Select a color'),
//                                 content: SingleChildScrollView(
//                                   child: BlockPicker(
//                                     pickerColor: currentColor,
//                                     onColorChanged: changeColor,
//                                   ),
//                                 ),
//                               );
//                             },
//                           );
//                         },
//                         child: const Text('Change me'),
//                         color: currentColor,
//                         textColor: useWhiteForeground(currentColor)
//                             ? const Color(0xffffffff)
//                             : const Color(0xff000000),
//                       ),
//                       RaisedButton(
//                         elevation: 3.0,
//                         onPressed: () {
//                           showDialog(
//                             context: context,
//                             builder: (BuildContext context) {
//                               return AlertDialog(
//                                 title: Text('Select colors'),
//                                 content: SingleChildScrollView(
//                                   child: MultipleChoiceBlockPicker(
//                                     pickerColors: currentColors,
//                                     onColorsChanged: changeColors,
//                                   ),
//                                 ),
//                               );
//                             },
//                           );
//                         },
//                         child: const Text('Change me again'),
//                         color: currentColor,
//                         textColor: useWhiteForeground(currentColor)
//                             ? const Color(0xffffffff)
//                             : const Color(0xff000000),
//                       )
//                     ]),
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }
//
// class UpperCaseTextFormatter extends TextInputFormatter {
//   @override
//   TextEditingValue formatEditUpdate(_, TextEditingValue nv) =>
//       TextEditingValue(text: nv.text.toUpperCase(), selection: nv.selection);
// }
