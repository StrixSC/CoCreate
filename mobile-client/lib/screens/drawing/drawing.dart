import 'dart:convert';
import 'dart:ui';

import 'package:Colorimage/models/drawing.dart';
import 'package:Colorimage/screens/drawing/toolbar.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
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
  bool allowMove = false;
  Offset? selectRef;
  Color pickerColor = const Color(0xff443a49);
  Color currentColor = const Color(0xff443a49);

  _DrawingScreenState(this._socket, this._user);

  @override
  void initState() {
    super.initState();
    socketException();
    socketSaveConfirmation();
    socketFreedrawReception();
    socketShapeReception();
    socketSelectionReception();
    socketTranslationReception();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
          preferredSize: const Size.fromHeight(50.0), // here the desired height
          child: Toolbar(changeTool, changeColor)),
      body: GestureDetector(
        //todo: remove hardcode variable when merge with login page
        onPanStart: (details) {
          switch (drawType) {
            case DrawingType.freedraw:
              if (shapeID != null) {
                socketSelectionEmission(lastShapeID!, false);
              }
              socketFreedrawEmission(details, DrawingState.down);
              break;
            case DrawingType.rectangle:
              socketShapeEmission(
                  details, DrawingType.rectangle, DrawingState.down);
              break;
            case DrawingType.ellipse:
              socketShapeEmission(
                  details, DrawingType.ellipse, DrawingState.down);
              break;
            case "select":
              allowMove = false;
              selectRef =
                  Offset(details.localPosition.dx, details.localPosition.dy);
              String? selectItem = getSelectedId(selectRef!);
              if (selectedItems.containsValue(_user.uid)) {
                selectedItems.forEach((oldActionId, userId) {
                  if (userId == _user.uid && oldActionId != selectItem) {
                    socketSelectionEmission(oldActionId, false);
                  }
                });
              }
              if (selectItem != null) {
                socketSelectionEmission(selectItem, true);
              }
              break;
          }
        },
        onPanUpdate: (details) {
          switch (drawType) {
            case DrawingType.freedraw:
              //todo: need to add only if i'm the person the selected it
              if (selectedItems.containsKey(lastShapeID)) {
                socketSelectionEmission(lastShapeID!, false);
              }
              socketFreedrawEmission(details, DrawingState.move);
              break;
            case DrawingType.rectangle:
              socketShapeEmission(
                  details, DrawingType.rectangle, DrawingState.move);
              break;
            case DrawingType.ellipse:
              socketShapeEmission(
                  details, DrawingType.ellipse, DrawingState.move);
              break;
            case "select":
              if (allowMove && selectedItems.containsValue(_user.uid)) {
                selectedItems.forEach((actionId, userId) {
                  if (userId == _user.uid) {
                    socketTranslationEmission(
                        actionId,
                        (details.localPosition - selectRef!).dx,
                        (details.localPosition - selectRef!).dy);
                    selectRef = details.localPosition;
                  }
                });
              }
              break;
          }
        },
        onPanEnd: (details) {
          switch (drawType) {
            case DrawingType.freedraw:
              socketFreedrawEmission(details, DrawingState.up);
              lastShapeID = shapeID;
              break;
            case DrawingType.rectangle:
              socketShapeEmission(
                  details, DrawingType.rectangle, DrawingState.up);
              lastShapeID = shapeID;
              break;
            case DrawingType.ellipse:
              socketShapeEmission(
                  details, DrawingType.ellipse, DrawingState.up);
              lastShapeID = shapeID;
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

  void changeColor(Color color) {
    setState(() => currentColor = color);
  }

  void changeTool(String type) {
    print(type);
    setState(() => drawType = type);
  }

  void socketSelectionReception() {
    _socket.on('selection:received', (data) {
      setState(() {
        if (data['isSelected']) {
          selectedItems.putIfAbsent(
              data['actionId'], () => data['selectedBy'] as String);
          allowMove = true;
        } else {
          selectedItems.remove(data['actionId']);
        }
      });
    });
  }

  void socketTranslationReception() {
    _socket.on('translation:received', (data) {
      setState(() {
        actionsMap.forEach((actionId, actionMap) {
          if (actionId == data['actionId']) {
            var offsetList = actionMap[DrawingType.freedraw] as List<Offset>;
            List<Offset> translateOffsetList = <Offset>[];

            for (var offset in offsetList) {
              translateOffsetList.add(offset.translate(
                  data['xTranslation'].toDouble(),
                  data['yTranslation'].toDouble()));
            }
            actionMap.update(DrawingType.freedraw, (value) => translateOffsetList);
            actionsMap.update(data['actionId'],
                (value) => actionMap as Map<String, List<Offset>>);
          }
        });
      });
    });
  }

  void socketShapeReception() {
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
  }

  void socketFreedrawReception() {
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
  }

  void socketSaveConfirmation() {
    _socket.on('action:saved', (data) {
      _socket.emit("selection:emit", {
        'actionId': data['actionId'],
        'username': _user.displayName,
        'userId': _user.uid,
        'collaborationId': "DEMO_COLLABORATION",
        'actionType': "Select",
        'isSelected': true,
      });
    });
  }

  void socketException() {
    _socket.on('exception', (data) {
      print(data);
      print("");
    });
  }

  void socketSelectionEmission(String selectItem, bool isSelected) {
    _socket.emit("selection:emit", {
      'actionId': selectItem,
      'username': _user.displayName,
      'userId': _user.uid,
      'collaborationId': "DEMO_COLLABORATION",
      'actionType': "Select",
      'isSelected': isSelected,
    });
  }

  void socketTranslationEmission(
      String selectItem, double xTranslation, double yTranslation) {
    _socket.emit("translation:emit", {
      'actionId': selectItem,
      'username': _user.displayName,
      'userId': _user.uid,
      'collaborationId': "DEMO_COLLABORATION",
      'actionType': "Select",
      'xTranslation': xTranslation,
      'yTranslation': yTranslation
    });
  }

  void socketShapeEmission(
      var details, String drawingType, String drawingState) {
    _socket.emit("shape:emit", {
      'x': (drawingState == DrawingState.up)
          ? endPoint.dx
          : details.localPosition.dx,
      'y': (drawingState == DrawingState.up)
          ? endPoint.dy
          : details.localPosition.dy,
      'collaborationId': "DEMO_COLLABORATION",
      'state': drawingState,
      'color': currentColor.value,
      'actionId': (drawingState == DrawingState.down)
          ? shapeID = const Uuid().v1()
          : shapeID,
      // todo: add fill button
      'isFilled': false,
      'shapeType': drawingType
    });
  }

  void socketFreedrawEmission(var details, String drawingState) {
    _socket.emit("freedraw:emit", {
      'x': (drawingState == DrawingState.up)
          ? endPoint.dx
          : details.localPosition.dx.toInt(),
      'y': (drawingState == DrawingState.up)
          ? endPoint.dy
          : details.localPosition.dy.toInt(),
      'collaborationId': "DEMO_COLLABORATION",
      'username': _user.displayName,
      'userId': _user.uid,
      'actionType': "Freedraw",
      'state': drawingState,
      'a': currentColor.alpha,
      'r': currentColor.red,
      'g': currentColor.green,
      'b': currentColor.blue,
      'width': 3,
      'isSelected': (drawingState == DrawingState.up) ? "false" : true,
      'actionId': (drawingState == DrawingState.down)
          ? shapeID = const Uuid().v1()
          : shapeID
    });
  }

  List<dynamic> convertOffsetToCoords(List<Offset> offsetList) {
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
