import 'dart:convert';
import 'dart:ui';

import 'package:Colorimage/models/drawing.dart';
import 'package:Colorimage/models/user.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:uuid/uuid.dart';

class DrawingScreen extends StatefulWidget {
  final IO.Socket _socket;
  final User _user;

  DrawingScreen(this._socket, this._user);

  @override
  State<DrawingScreen> createState() => _DrawingScreenState(_socket, _user);
}

class _DrawingScreenState extends State<DrawingScreen> {
  Map paintsMap = <String, Paint>{};
  Offset endPoint = const Offset(-1, -1);
  String drawType = DrawingType.freedraw;
  String? shapeID;
  String? lastShapeID;
  final IO.Socket _socket;
  final User _user;
  Map actionsMap = <String, Map<String, dynamic>>{};
  Map selectedItems = <String, String>{};

  _DrawingScreenState(this._socket, this._user);

  @override
  void initState() {
    super.initState();
    _socket.on('exception', (data) {
      print(data);
      print("");
    });
    _socket.on('action:saved', (data) {
      _socket.emit("selection:emit", {
        'actionId': data['actionId'],
        'username': _user.username,
        'userId': _user.id,
        'collaborationId': "DEMO_COLLABORATION",
        'actionType': "Select",
        'isSelected': true,
      });
    });
    _socket.on('freedraw:received', (data) {
      setState(() {
        if (data['state'] == DrawingState.down) {
          Map map = <String, List<Offset>>{};
          List<Offset> offsetList = <Offset>[];
          offsetList.add(Offset(data['x'].toDouble(), data['y'].toDouble()));
          map.putIfAbsent(DrawingType.freedraw, () => offsetList);
          actionsMap.putIfAbsent(
              data['actionId'], () => map as Map<String, List<Offset>>);
          final paint = Paint()
            ..color = Color.fromARGB(data['a'] as int, data['r'] as int,
                data['g'] as int, data['b'] as int)
            ..isAntiAlias = true
            ..strokeWidth = 6.0
            ..style = PaintingStyle.stroke;
          paintsMap.putIfAbsent(data['actionId'], () => paint);
        } else if (data['state'] == DrawingState.move) {
          actionsMap.forEach((actionId, actionMap) {
            if (actionId == data['actionId']) {
              actionMap[DrawingType.freedraw]
                  .add(Offset(data['x'].toDouble(), data['y'].toDouble()));
              actionsMap.update(data['actionId'],
                  (value) => actionMap as Map<String, List<Offset>>);
            }
          });
        }
      });
    });

    _socket.on('shape:received', (data) {
      setState(() {
        if (data['state'] == DrawingState.down) {
          Map map = <String, List<Offset>>{};
          List<Offset> offsetList = <Offset>[];
          offsetList.add(Offset(data['x'].toDouble(), data['y'].toDouble()));
          map.putIfAbsent(data['shapeType'], () => offsetList);
          actionsMap.putIfAbsent(
              data['actionId'], () => map as Map<String, List<Offset>>);
          final paint = Paint()
            ..color = Color(data['color'])
            ..isAntiAlias = true
            ..strokeWidth = 6.0
            ..style =
                data['isFilled'] ? PaintingStyle.fill : PaintingStyle.stroke;
          paintsMap.putIfAbsent(data['actionId'], () => paint);
        } else if (data['state'] == DrawingState.move) {
          actionsMap.forEach((actionId, actionMap) {
            if (actionId == data['actionId']) {
              actionMap[data['shapeType']]
                  .add(Offset(data['x'].toDouble(), data['y'].toDouble()));
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
    _socket.on('selection:received', (data) {
      setState(() {
        if (data['isSelected']) {
          selectedItems.putIfAbsent(
              data['actionId'], () => data['selectedBy'] as String);
        } else {
          selectedItems.remove(data['actionId']);
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
                drawType = DrawingType.freedraw;
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
                drawType = DrawingType.ellipse;
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
                drawType = DrawingType.rectangle;
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
        //todo: remove hardcode variable when merge with login page
        onPanStart: (details) {
          switch (drawType) {
            case DrawingType.freedraw:
              if (shapeID != null) {
                _socket.emit("selection:emit", {
                  'actionId': lastShapeID,
                  'username': _user.username,
                  'userId': _user.id,
                  'collaborationId': "DEMO_COLLABORATION",
                  'actionType': "Select",
                  'isSelected': "false",
                });
              }
              _socket.emit("freedraw:emit", {
                'x': details.localPosition.dx.toInt(),
                'y': details.localPosition.dy.toInt(),
                'collaborationId': "DEMO_COLLABORATION",
                'username': _user.username,
                'userId': _user.id,
                'actionType': "Freedraw",
                'state': DrawingState.down,
                'a': currentColor.alpha,
                'r': currentColor.red,
                'g': currentColor.green,
                'b': currentColor.blue,
                'width': 3,
                'isSelected': true,
                'actionId': shapeID = const Uuid().v1()
              });
              break;
            case DrawingType.rectangle:
              _socket.emit("shape:emit", {
                'x': details.localPosition.dx,
                'y': details.localPosition.dy,
                'collaborationId': "DEMO_COLLABORATION",
                'state': DrawingState.down,
                'color': currentColor.value,
                'actionId': shapeID = const Uuid().v1(),
                // todo: add fill button
                'isFilled': false,
                'shapeType': DrawingType.rectangle
              });
              break;
            case DrawingType.ellipse:
              _socket.emit("shape:emit", {
                'x': details.localPosition.dx,
                'y': details.localPosition.dy,
                'collaborationId': "DEMO_COLLABORATION",
                'state': DrawingState.down,
                'color': currentColor.value,
                'actionId': shapeID = const Uuid().v1(),
                // todo: add fill button
                'isFilled': false,
                'shapeType': DrawingType.ellipse
              });
              break;
            case "select":
              String? selectItem = getSelectedId(
                  Offset(details.localPosition.dx, details.localPosition.dy));
              if (selectItem != null) {
                _socket.emit("selection:emit", {
                  'actionId': selectItem,
                  'username': _user.username,
                  'userId': _user.id,
                  'collaborationId': "DEMO_COLLABORATION",
                  'actionType': "Select",
                  'isSelected': true,
                });
              }
              break;
          }
        },
        onPanUpdate: (details) {
          switch (drawType) {
            case DrawingType.freedraw:
              //todo: only if i'm the person the selected it
              if(selectedItems.containsKey(lastShapeID)){
                _socket.emit("selection:emit", {
                  'actionId': lastShapeID,
                  'username': _user.username,
                  'userId': _user.id,
                  'collaborationId': "DEMO_COLLABORATION",
                  'actionType': "Select",
                  'isSelected': "false",
                });
              }
              _socket.emit("freedraw:emit", {
                'x': details.localPosition.dx.toInt(),
                'y': details.localPosition.dy.toInt(),
                'collaborationId': "DEMO_COLLABORATION",
                'username': _user.username,
                'userId': _user.id,
                'actionType': "Freedraw",
                'state': DrawingState.move,
                'a': currentColor.alpha,
                'r': currentColor.red,
                'g': currentColor.green,
                'b': currentColor.blue,
                'width': 3,
                'isSelected': true,
                'actionId': shapeID,
              });
              break;
            case DrawingType.rectangle:
              _socket.emit("shape:emit", {
                'x': details.localPosition.dx,
                'y': details.localPosition.dy,
                'state': DrawingState.move,
                'actionId': shapeID,
                'shapeType': DrawingType.rectangle
              });
              break;
            case DrawingType.ellipse:
              _socket.emit("shape:emit", {
                'x': details.localPosition.dx,
                'y': details.localPosition.dy,
                'state': DrawingState.move,
                'actionId': shapeID,
                'shapeType': DrawingType.ellipse
              });
              break;
          }
        },
        onPanEnd: (details) {
          switch (drawType) {
            case DrawingType.freedraw:
              _socket.emit("freedraw:emit", {
                'x': endPoint.dx.toInt(),
                'y': endPoint.dy.toInt(),
                'collaborationId': "DEMO_COLLABORATION",
                'username': _user.username,
                'userId': _user.id,
                'actionType': "Freedraw",
                'state': DrawingState.up,
                'a': currentColor.alpha,
                'r': currentColor.red,
                'g': currentColor.green,
                'b': currentColor.blue,
                'width': 3,
                'isSelected': "false",
                'actionId': shapeID,
                'offsets': json
                    .encode(test(actionsMap[shapeID][DrawingType.freedraw])),
              });
              lastShapeID = shapeID;
              break;
            case DrawingType.rectangle:
              _socket.emit("shape:emit", {
                'x': endPoint.dx,
                'y': endPoint.dy,
                'state': DrawingState.up,
                'actionId': shapeID,
                'shapeType': DrawingType.rectangle
              });
              break;
            case DrawingType.ellipse:
              _socket.emit("shape:emit", {
                'x': endPoint.dx,
                'y': endPoint.dy,
                'state': DrawingState.up,
                'actionId': shapeID,
                'shapeType': DrawingType.ellipse
              });
              break;
          }
        },
        child: Center(
          child: CustomPaint(
            painter: Painter(drawType, paintsMap, actionsMap, selectedItems),
            child: SizedBox(
              height: MediaQuery.of(context).size.height,
              width: MediaQuery.of(context).size.width,
            ),
          ),
        ),
      ),
    );
  }

  List<dynamic> test(List<Offset> offsetList) {
    var coords = [];
    for (var offset in offsetList) {
      coords.add({'x': offset.dx, 'y': offset.dy});
    }
    return coords;
  }

  String? getSelectedId(Offset offset) {
    List<String> overlapItems = <String>[];
    actionsMap.forEach((actionId, actionMap) {
      (actionMap as Map<String, List<Offset>>).forEach((action, offsetList) {
        if (action == DrawingType.freedraw) {
          Path path = Path();
          path.moveTo(offsetList.first.dx, offsetList.first.dy);
          for (int i = 1; i < offsetList.length; i++) {
            path.lineTo(offsetList[i].dx, offsetList[i].dy);
          }
          for (int i = 0; i < path.computeMetrics().first.length; i++) {
            Tangent? tangent =
                path.computeMetrics().first.getTangentForOffset(i.toDouble());
            if ((tangent!.position - offset).distance.toInt() <=
                paintsMap[actionId].strokeWidth / 2) {
              overlapItems.add(actionId);
            }
          }
        } else if (action == DrawingType.rectangle ||
            action == DrawingType.ellipse) {
          Rect rect = Rect.fromLTRB(offsetList.first.dx, offsetList.first.dy,
              offsetList.last.dx, offsetList.last.dy);
          Path path = Path();
          if (action == DrawingType.rectangle) {
            path.addRect(rect);
          } else {
            path.addOval(rect);
          }
          if (path.contains(offset)) {
            overlapItems.add(actionId);
          }
        }
      });
    });
    if (overlapItems.isNotEmpty) {
      return overlapItems.last;
    }
    return null;
  }
}

class Painter extends CustomPainter {
  Painter(this.drawType, this.paintsMap, this.actionsMap, this.selectedItems);

  Map paintsMap;
  String drawType;
  Map actionsMap;
  Map selectedItems;

  @override
  void paint(Canvas canvas, Size size) {
    actionsMap.forEach((actionId, action) {
      action.forEach((toolType, offsetList) {
        if (toolType == DrawingType.freedraw) {
          for (var i = 0; i < offsetList.length - 1; i++) {
            canvas.drawLine(
                offsetList[i], offsetList[i + 1], paintsMap[actionId]);
          }
          if (selectedItems.containsKey(actionId)) {
            Path path = Path();
            path.moveTo(offsetList.first.dx, offsetList.first.dy);
            for (int i = 1; i < offsetList.length; i++) {
              path.lineTo(offsetList[i].dx, offsetList[i].dy);
            }
            canvas.drawPath(getCorner(path), paintsMap[actionId]);
          }
        }
        if (toolType == DrawingType.rectangle) {
          Rect rect = Rect.fromLTRB(offsetList.first.dx, offsetList.first.dy,
              offsetList.last.dx, offsetList.last.dy);
          canvas.drawRect(rect, paintsMap[actionId]);
        }
        if (toolType == DrawingType.ellipse) {
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
