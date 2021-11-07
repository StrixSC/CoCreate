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
  Map paintsMap = <String, Paint>{};
  Offset endPoint = const Offset(-1, -1);
  String drawType = "line";
  late String shapeID;
  final IO.Socket _socket;
  Map actionsMap = <String, Map<String, List<Offset>>>{};
  List<String> selectedItems = <String>[];
  List<String> mySelectedItem = <String>[];

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
            ..strokeWidth = 6.0
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
            ..strokeWidth = 6.0
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
    _socket.on('select:receive', (data) {
      setState(() {
        selectedItems.add(data['selectedActionId']);
        print("");
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
                'fill': true,
                'shapeType': "cercle"
              });
              break;
            case "select":
              String? selectItem = getSelectedId(
                  Offset(details.localPosition.dx, details.localPosition.dy));
              if (selectItem != null && !selectedItems.contains(selectItem)) {
                _socket.emit("select:emit", {
                  'state': "down",
                  'selectedActionId': selectItem,
                });
                mySelectedItem.add(selectItem);
              }
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
            painter: Painter(drawType, paintsMap, actionsMap),
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

  String? getSelectedId(Offset offset) {
    List<String> overlapItems = <String>[];
    actionsMap.forEach((actionId, actionMap) {
      (actionMap as Map<String, List<Offset>>).forEach((action, offsetList) {
        if (action == "line") {
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
        } else if (action == "rect" || action == "cercle") {
          Rect rect = Rect.fromLTRB(offsetList.first.dx, offsetList.first.dy,
              offsetList.last.dx, offsetList.last.dy);
          Path path = Path();
          if (action == "rect") {
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
    if(overlapItems.isNotEmpty){
      return overlapItems.last;
    }
    return null;
  }
}

class Painter extends CustomPainter {
  Painter(this.drawType, this.paintsMap, this.actionsMap);
  Map paintsMap;
  String drawType;
  Map actionsMap;

  @override
  void paint(Canvas canvas, Size size) {
    actionsMap.forEach((actionId, action) {
      action.forEach((toolType, offsetList) {
        if (toolType == "line") {
          for (var i = 0; i < offsetList.length - 1; i++) {
            canvas.drawLine(
                offsetList[i], offsetList[i + 1], paintsMap[actionId]);
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
