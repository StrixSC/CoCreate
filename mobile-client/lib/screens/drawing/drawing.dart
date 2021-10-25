import 'dart:ui';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class DrawingScreen extends StatefulWidget {
  final IO.Socket _socket;

  DrawingScreen(this._socket);

  @override
  State<DrawingScreen> createState() => _DrawingScreenState(this._socket);
}

class _DrawingScreenState extends State<DrawingScreen> {
  List<Offset> offsets = <Offset>[];
  List<Paint> paintList = <Paint>[];
  Path path = Path();
  Offset endPoint = const Offset(-1, -1);
  String drawType = "line";
  final IO.Socket _socket;

  _DrawingScreenState(this._socket);

  @override
  void initState() {
    super.initState();

    _socket.on('freedraw:receive', (data) {
      setState(() {
        if (data['coords']['x'] == -1) {
          print(data['coords']['x'].runtimeType);
        } else {
          print(data['coords']['x'].runtimeType);
        }
        // offsets.add(Offset(data['coords']['x'], data['coords']['y']));
      });
    });
  }

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
                    title: const Text('Select a color'),
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
          _socket.emit("freedraw:emit", {
            'x': details.localPosition.dx,
            'y': details.localPosition.dy,
            'state': "down"
          });
        },
        onPanUpdate: (details) {
          _socket.emit("freedraw:emit", {
            'x': details.localPosition.dx,
            'y': details.localPosition.dy,
            'state': "move"
          });
        },
        onPanEnd: (details) {
          _socket.emit("freedraw:emit",
              {'x': endPoint.dx, 'y': endPoint.dy, 'state': "up"});
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
  List<int> selectId = <int>[];

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = currentColor
      ..isAntiAlias = true
      ..strokeWidth = 6.0
      ..style = PaintingStyle.stroke;

    List<PathMetric> pathMetrics;

    pathMetrics = path.computeMetrics().toList();

    if (drawType == "line") {
      for (var i = 0; i < offsets.length - 1; i++) {
        if (offsets[i] != endPoint && offsets[i + 1] != endPoint) {
          canvas.drawLine(offsets[i], offsets[i + 1], paint);
        } else if (offsets[i] != endPoint) {
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
      for (var i = 0; i < pathMetrics.length; i++) {
        for (var j = 0; j < pathMetrics.elementAt(i).length; j++) {
          Tangent? tangent =
              pathMetrics.elementAt(i).getTangentForOffset(j.toDouble());
          if ((tangent!.position - offsets.first).distance.toInt() <=
              paintList.elementAt(0).strokeWidth / 2) {
            if (offsets.last != endPoint) {
              Path dragPath = pathMetrics
                  .elementAt(i)
                  .extractPath(0, pathMetrics.elementAt(i).length)
                  .shift(Offset(offsets.last.dx - offsets.first.dx,
                      offsets.last.dy - offsets.first.dy));
              canvas.drawPath(getCorner(dragPath), paintList.elementAt(i));
              canvas.drawPath(dragPath, paintList.elementAt(i));
              selectId.add(i);
              break;
            } else {
              offsets.removeLast();
              Path dragPath = pathMetrics
                  .elementAt(i)
                  .extractPath(0, pathMetrics.elementAt(i).length)
                  .shift(Offset(offsets.last.dx - offsets.first.dx,
                      offsets.last.dy - offsets.first.dy));
              Paint paintCopy = paintList.removeAt(i);
              paintList.add(paintCopy);
              pathMetrics.removeAt(i);
              path.reset();
              for (var element in pathMetrics) {
                path.addPath(
                    element.extractPath(0, element.length), const Offset(0, 0));
              }
              path.addPath(dragPath, const Offset(0, 0));
              offsets.add(endPoint);
              selectId.add(i);
              break;
            }
          }
        }
        if (selectId.isNotEmpty) {
          break;
        }
      }
      if (offsets.last == endPoint) {
        offsets.clear();
      }
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
      if (selectId.isNotEmpty && offsets.isNotEmpty) {
        if (selectId.elementAt(0) == i) {
          //Don't draw the selected shape because it is already draw while
          // shifting
        } else {
          PathMetric pathMetric = pathMetrics.elementAt(i);
          canvas.drawPath(pathMetric.extractPath(0, pathMetric.length),
              paintList.elementAt(i));
        }
      } else {
        PathMetric pathMetric = pathMetrics.elementAt(i);
        canvas.drawPath(pathMetric.extractPath(0, pathMetric.length),
            paintList.elementAt(i));
      }
    }
  }

  Path getCorner(Path dragPath) {
    Rect bounds = dragPath.getBounds();
    var pathCorner = Path();

    pathCorner.moveTo(bounds.topLeft.dx + 5, bounds.topLeft.dy - 5);
    pathCorner.lineTo(bounds.topLeft.dx - 5, bounds.topLeft.dy - 5);
    pathCorner.lineTo(bounds.topLeft.dx - 5, bounds.topLeft.dy + 5);

    pathCorner.moveTo(bounds.topRight.dx - 5, bounds.topRight.dy - 5);
    pathCorner.lineTo(bounds.topRight.dx + 5, bounds.topRight.dy - 5);
    pathCorner.lineTo(bounds.topRight.dx + 5, bounds.topRight.dy + 5);

    pathCorner.moveTo(bounds.bottomLeft.dx - 5, bounds.bottomLeft.dy - 5);
    pathCorner.lineTo(bounds.bottomLeft.dx - 5, bounds.bottomLeft.dy + 5);
    pathCorner.lineTo(bounds.bottomLeft.dx + 5, bounds.bottomLeft.dy + 5);

    pathCorner.moveTo(bounds.bottomRight.dx + 5, bounds.bottomRight.dy - 5);
    pathCorner.lineTo(bounds.bottomRight.dx + 5, bounds.bottomRight.dy + 5);
    pathCorner.lineTo(bounds.bottomRight.dx - 5, bounds.bottomRight.dy + 5);

    return pathCorner;
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
