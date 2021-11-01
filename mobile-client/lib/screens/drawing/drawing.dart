import 'dart:ui';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:uuid/uuid.dart';

class DrawingScreen extends StatefulWidget {
  final IO.Socket _socket;

  DrawingScreen(this._socket);

  @override
  State<DrawingScreen> createState() => _DrawingScreenState(this._socket);
}

class _DrawingScreenState extends State<DrawingScreen> {
  // todo: remove this once the drawing don't need it anymore.
  List<Offset> offsets = <Offset>[];

  Map paintsMap = <String, Paint>{};

  Path path = Path();
  Offset endPoint = const Offset(-1, -1);
  String drawType = "line";
  late String shapeID;
  final IO.Socket _socket;
  Map actionsMap = <String, Map<String, List<Offset>>>{};

  _DrawingScreenState(this._socket);

  @override
  void initState() {
    super.initState();
    _socket.on('freedraw:receive', (data) {
      setState(() {
        if (data['state'] == "down") {
          Map map = <String, List<Offset>>{};
          List<Offset> offsetList = <Offset>[];
          offsetList.add(Offset(data['x'].toDouble(), data['y'].toDouble()));
          map.putIfAbsent("line", () => offsetList);
          actionsMap.putIfAbsent(
              data['actionId'], () => map as Map<String, List<Offset>>);
          final paint = Paint()
            ..color = Color(data['color'])
            // todo: en attandant que le client lourd integre les couleurs
            // ..color = Color(0xFFFF9000)
            ..isAntiAlias = true
            ..strokeWidth = 3.0
            ..style = PaintingStyle.stroke;
          paintsMap.putIfAbsent(data['actionId'], () => paint);
        } else if (data['state'] == "move") {
          actionsMap.forEach((actionId, actionMap) {
            if (actionId == data['actionId']) {
              actionMap["line"]
                  .add(Offset(data['x'].toDouble(), data['y'].toDouble()));
              actionsMap.update(data['actionId'],
                  (value) => actionMap as Map<String, List<Offset>>);
            }
          });
        }
      });
    });

    _socket.on('shapedraw:receive', (data) {
      setState(() {
        if (data['state'] == "down") {
          Map map = <String, List<Offset>>{};
          List<Offset> offsetList = <Offset>[];
          offsetList.add(Offset(data['x'], data['y']));
          map.putIfAbsent(data['shapeType'], () => offsetList);
          actionsMap.putIfAbsent(
              data['actionId'], () => map as Map<String, List<Offset>>);
          final paint = Paint()
            ..color = Color(data['color'])
            ..isAntiAlias = true
            ..strokeWidth = 3.0
            ..style = data['fill'] ? PaintingStyle.fill : PaintingStyle.stroke;
          paintsMap.putIfAbsent(data['actionId'], () => paint);
        } else if (data['state'] == "move") {
          actionsMap.forEach((actionId, actionMap) {
            if (actionId == data['actionId']) {
              actionMap[data['shapeType']].add(Offset(data['x'], data['y']));
              actionsMap.update(data['actionId'],
                  (value) => actionMap as Map<String, List<Offset>>);
            }
          });
        } else {
          actionsMap.forEach((actionId, actionMap) {
            if (actionId == data['actionId']) {
              List<Offset> rectOffsets = <Offset>[];
              rectOffsets.add(actionMap.values.first.first);
              rectOffsets.add(actionMap.values.first.last);
              actionMap.update(data['shapeType'], (value) => rectOffsets);
              actionsMap.update(data['actionId'],
                  (value) => actionMap as Map<String, List<Offset>>);
            }
          });
        }
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
      appBar: AppBar(
        actions: <Widget>[
          Padding(
            padding: const EdgeInsets.all(8.0),
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
        ],
      ),
      body: GestureDetector(
        onPanStart: (details) {
          switch (drawType) {
            case "line":
              _socket.emit("freedraw:emit", {
                'x': details.localPosition.dx,
                'y': details.localPosition.dy,
                'state': "down",
                'color': currentColor.value,
                'actionId': shapeID = const Uuid().v1()
              });
              break;
            case "rect":
              _socket.emit("shapedraw:emit", {
                'x': details.localPosition.dx,
                'y': details.localPosition.dy,
                'state': "down",
                'color': currentColor.value,
                'actionId': shapeID = const Uuid().v1(),
                // todo: add fill button
                'fill': false,
                'shapeType': "rect"
              });
              break;
            case "cercle":
              _socket.emit("shapedraw:emit", {
                'x': details.localPosition.dx,
                'y': details.localPosition.dy,
                'state': "down",
                'color': currentColor.value,
                'actionId': shapeID = const Uuid().v1(),
                // todo: add fill button
                'fill': false,
                'shapeType': "cercle"
              });
              break;
          }
        },
        onPanUpdate: (details) {
          switch (drawType) {
            case "line":
              _socket.emit("freedraw:emit", {
                'x': details.localPosition.dx,
                'y': details.localPosition.dy,
                'state': "move",
                'actionId': shapeID,
              });
              break;
            case "rect":
              _socket.emit("shapedraw:emit", {
                'x': details.localPosition.dx,
                'y': details.localPosition.dy,
                'state': "move",
                'actionId': shapeID,
                'shapeType': "rect"
              });
              break;
            case "cercle":
              _socket.emit("shapedraw:emit", {
                'x': details.localPosition.dx,
                'y': details.localPosition.dy,
                'state': "move",
                'actionId': shapeID,
                'shapeType': "cercle"
              });
              break;
          }
        },
        onPanEnd: (details) {
          switch (drawType) {
            case "line":
              _socket.emit("freedraw:emit", {
                'x': endPoint.dx,
                'y': endPoint.dy,
                'state': "up",
                'actionId': shapeID
              });
              break;
            case "rect":
              _socket.emit("shapedraw:emit", {
                'x': endPoint.dx,
                'y': endPoint.dy,
                'state': "up",
                'actionId': shapeID,
                'shapeType': "rect"
              });
              break;
            case "cercle":
              _socket.emit("shapedraw:emit", {
                'x': endPoint.dx,
                'y': endPoint.dy,
                'state': "up",
                'actionId': shapeID,
                'shapeType': "cercle"
              });
              break;
          }
        },
        child: Center(
          child: CustomPaint(
            painter: Painter(path, drawType, paintsMap, actionsMap),
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
  Painter(this.path, this.drawType, this.paintsMap, this.actionsMap);
  Map paintsMap;
  String drawType;
  Path path;
  Offset endPoint = const Offset(-1, -1);
  List<int> selectId = <int>[];
  Map actionsMap;

  @override
  void paint(Canvas canvas, Size size) {
    actionsMap.forEach((actionId, action) {
      action.forEach((toolType, offsetList) {
        if (toolType == "line") {
          for (var i = 0; i < offsetList.length - 1; i++) {
            if (offsetList[i] != endPoint && offsetList[i + 1] != endPoint) {
              canvas.drawLine(
                  offsetList[i], offsetList[i + 1], paintsMap[actionId]);
            }
          }
        }
        if (toolType == "rect") {
          Rect rect = Rect.fromLTRB(offsetList.first.dx, offsetList.first.dy,
              offsetList.last.dx, offsetList.last.dy);
          canvas.drawRect(rect, paintsMap[actionId]);
        }
        if (toolType == "cercle") {
          Rect rect = Rect.fromLTRB(offsetList.first.dx, offsetList.first.dy,
              offsetList.last.dx, offsetList.last.dy);
          canvas.drawOval(rect, paintsMap[actionId]);
        }
      });
    });

    // if (drawType == "select") {
    //   for (var i = 0; i < pathMetrics.length; i++) {
    //     for (var j = 0; j < pathMetrics.elementAt(i).length; j++) {
    //       Tangent? tangent =
    //           pathMetrics.elementAt(i).getTangentForOffset(j.toDouble());
    //       if ((tangent!.position - offsets.first).distance.toInt() <=
    //           paintList.elementAt(0).strokeWidth / 2) {
    //         if (offsets.last != endPoint) {
    //           Path dragPath = pathMetrics
    //               .elementAt(i)
    //               .extractPath(0, pathMetrics.elementAt(i).length)
    //               .shift(Offset(offsets.last.dx - offsets.first.dx,
    //                   offsets.last.dy - offsets.first.dy));
    //           canvas.drawPath(getCorner(dragPath), paintList.elementAt(i));
    //           canvas.drawPath(dragPath, paintList.elementAt(i));
    //           selectId.add(i);
    //           break;
    //         } else {
    //           offsets.removeLast();
    //           Path dragPath = pathMetrics
    //               .elementAt(i)
    //               .extractPath(0, pathMetrics.elementAt(i).length)
    //               .shift(Offset(offsets.last.dx - offsets.first.dx,
    //                   offsets.last.dy - offsets.first.dy));
    //           Paint paintCopy = paintList.removeAt(i);
    //           paintList.add(paintCopy);
    //           pathMetrics.removeAt(i);
    //           path.reset();
    //           for (var element in pathMetrics) {
    //             path.addPath(
    //                 element.extractPath(0, element.length), const Offset(0, 0));
    //           }
    //           path.addPath(dragPath, const Offset(0, 0));
    //           offsets.add(endPoint);
    //           selectId.add(i);
    //           break;
    //         }
    //       }
    //     }
    //     if (selectId.isNotEmpty) {
    //       break;
    //     }
    //   }
    //   if (offsets.last == endPoint) {
    //     offsets.clear();
    //   }
    // }

    // if (drawType == "cercle" || drawType == "rect") {
    //   if (offsets.last == endPoint) {
    //     offsets.removeLast();
    //     Rect rectOrElip = Rect.fromLTRB(offsets.first.dx, offsets.first.dy,
    //         offsets.last.dx, offsets.last.dy);
    //     if (drawType == "cercle") {
    //       paintList.add(paint);
    //       path.addOval(rectOrElip);
    //     } else {
    //       paintList.add(paint);
    //       path.addRect(rectOrElip);
    //     }
    //     offsets.clear();
    //   } else {
    //     Rect rectOrElip = Rect.fromLTRB(offsets.first.dx, offsets.first.dy,
    //         offsets.last.dx, offsets.last.dy);
    //     if (drawType == "cercle") {
    //       canvas.drawOval(rectOrElip, paint);
    //     } else {
    //       canvas.drawRect(rectOrElip, paint);
    //     }
    //   }
    // }

    // pathMetrics = path.computeMetrics().toList();
    // for (var i = 0; i < pathMetrics.length; i++) {
    //   // if (selectId.isNotEmpty && offsets.isNotEmpty) {
    //   //   if (selectId.elementAt(0) == i) {
    //   //     //Don't draw the selected shape because it is already draw while
    //   //     // shifting
    //   //   } else {
    //   //     PathMetric pathMetric = pathMetrics.elementAt(i);
    //   //     canvas.drawPath(pathMetric.extractPath(0, pathMetric.length),
    //   //         paintList.elementAt(i));
    //   //   }
    //   // } else {
    //   PathMetric pathMetric = pathMetrics.elementAt(i);
    //   canvas.drawPath(pathMetric.extractPath(0, pathMetric.length), paint);
    // }
    // }
  }

  // Path getCorner(Path dragPath) {
  //   Rect bounds = dragPath.getBounds();
  //   var pathCorner = Path();
  //
  //   pathCorner.moveTo(bounds.topLeft.dx + 5, bounds.topLeft.dy - 5);
  //   pathCorner.lineTo(bounds.topLeft.dx - 5, bounds.topLeft.dy - 5);
  //   pathCorner.lineTo(bounds.topLeft.dx - 5, bounds.topLeft.dy + 5);
  //
  //   pathCorner.moveTo(bounds.topRight.dx - 5, bounds.topRight.dy - 5);
  //   pathCorner.lineTo(bounds.topRight.dx + 5, bounds.topRight.dy - 5);
  //   pathCorner.lineTo(bounds.topRight.dx + 5, bounds.topRight.dy + 5);
  //
  //   pathCorner.moveTo(bounds.bottomLeft.dx - 5, bounds.bottomLeft.dy - 5);
  //   pathCorner.lineTo(bounds.bottomLeft.dx - 5, bounds.bottomLeft.dy + 5);
  //   pathCorner.lineTo(bounds.bottomLeft.dx + 5, bounds.bottomLeft.dy + 5);
  //
  //   pathCorner.moveTo(bounds.bottomRight.dx + 5, bounds.bottomRight.dy - 5);
  //   pathCorner.lineTo(bounds.bottomRight.dx + 5, bounds.bottomRight.dy + 5);
  //   pathCorner.lineTo(bounds.bottomRight.dx - 5, bounds.bottomRight.dy + 5);
  //
  //   return pathCorner;
  // }

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
