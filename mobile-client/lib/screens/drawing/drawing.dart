import 'dart:math';
import 'dart:ui';

import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/drawing.dart';
import 'package:Colorimage/screens/drawing/toolbar.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:uuid/uuid.dart';
import 'package:vector_math/vector_math_64.dart' as vec;

enum Bounds {
  topLeft,
  topCenter,
  topRight,
  rightCenter,
  bottomRight,
  bottomCenter,
  bottomLeft,
  leftCenter,
}

class DrawingScreen extends StatefulWidget {
  final io.Socket _socket;
  final User _user;

  const DrawingScreen(this._socket, this._user);

  @override
  State<DrawingScreen> createState() => _DrawingScreenState(_socket, _user);
}

class _DrawingScreenState extends State<DrawingScreen> {
  final io.Socket _socket;
  final User _user;
  Offset endPoint = const Offset(-1, -1);
  String drawType = DrawingType.freedraw;
  String? shapeID;
  String? lastShapeID;
  Map paintsMap = <String, Paint>{};
  Map actionsMap = <String, Map<String, Path>>{};
  Map selectedItems = <String, String>{};
  Map selectPoints = <String, List<Offset>>{};
  bool allowMove = false;
  Offset? selectRef; // offset reference of selected item
  Map shapesOffsets = <String, List<Offset>>{};
  Color currentBodyColor = const Color(0xff443a49);
  Color currentBorderColor = const Color(0xff443a49);
  Color currentBackgroundColor = const Color(0xff443a49);
  List<Rect>? selectedBounds;
  int? selectedBoundIndex;
  Offset initialResizeCenter = const Offset(0, 0);
  Offset initialTapLocation = const Offset(0, 0);
  bool allowResize = false;

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
    socketRotationReception();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Row(children: [
          Toolbar(changeTool, changeColor),
          Expanded(
              child: GestureDetector(
            onPanStart: (details) {
              switch (drawType) {
                case DrawingType.freedraw:
                  unselectLastShape();
                  socketFreedrawEmission(details, DrawingState.down);
                  break;
                case DrawingType.rectangle:
                  unselectLastShape();
                  socketShapeEmission(
                      details, DrawingType.rectangle, DrawingState.down);
                  break;
                case DrawingType.ellipse:
                  unselectLastShape();
                  socketShapeEmission(
                      details, DrawingType.ellipse, DrawingState.down);
                  break;
                case "select":
                  allowMove = false;
                  selectRef = Offset(
                      details.localPosition.dx, details.localPosition.dy);
                  String? selectItem = getSelectedId(selectRef!);
                  if (selectedItems.containsValue(_user.uid)) {
                    String actionToRemove = "";
                    selectedItems.forEach((oldActionId, userId) {
                      if (userId == _user.uid &&
                          oldActionId != selectItem &&
                          !hasSelectedBounds(details)) {
                        socketSelectionEmission(oldActionId, false);
                        actionToRemove = oldActionId;
                      }
                    });
                    if (actionToRemove != "") {
                      selectedItems.remove(actionToRemove);
                    }
                    if (hasSelectedBounds(details) && actionToRemove == "") {
                      allowResize = true;
                      initialResizeCenter = Offset(
                          selectedBounds![Bounds.topCenter.index].center.dx,
                          selectedBounds![Bounds.rightCenter.index].center.dy);
                      initialTapLocation = details.localPosition;
                    }
                  }
                  if (selectItem != null &&
                      !selectedItems.containsKey(selectItem)) {
                    socketSelectionEmission(selectItem, true);
                    lastShapeID = selectItem;
                  } else {
                    allowMove = true;
                  }
                  break;
                case "rotate":
                  if (selectedItems.containsValue(_user.uid)) {
                    selectedItems.forEach((actionId, selectedBy) {
                      if (selectedBy == _user.uid) {
                        socketRotationEmission(
                            details, DrawingState.down, actionId);
                      }
                    });
                  }
                  break;
              }
            },
            onPanUpdate: (details) {
              switch (drawType) {
                case DrawingType.freedraw:
                  unselectLastShape();
                  socketFreedrawEmission(details, DrawingState.move);
                  break;
                case DrawingType.rectangle:
                  unselectLastShape();
                  socketShapeEmission(
                      details, DrawingType.rectangle, DrawingState.move);
                  break;
                case DrawingType.ellipse:
                  unselectLastShape();
                  socketShapeEmission(
                      details, DrawingType.ellipse, DrawingState.move);
                  break;
                case "select":
                  // todo: ajuster pour que se soit juste avec les carré blanc
                  if (allowResize && selectedItems.containsValue(_user.uid)) {
                    selectedItems.forEach((actionId, selectedBy) {
                      if (selectedBy == _user.uid) {
                        socketResizeReception(
                            actionId, details.localPosition, selectRef!);
                        selectRef = details.localPosition;
                      }
                    });
                  } else if (allowMove &&
                      selectedItems.containsValue(_user.uid)) {
                    selectedItems.forEach((actionId, selectedBy) {
                      if (selectedBy == _user.uid) {
                        socketTranslationEmission(
                            actionId,
                            (details.localPosition - selectRef!).dx,
                            (details.localPosition - selectRef!).dy,
                            DrawingState.move);
                        selectRef = details.localPosition;
                      }
                    });
                  }
                  break;
                case "rotate":
                  if (selectedItems.containsValue(_user.uid)) {
                    selectedItems.forEach((actionId, selectedBy) {
                      if (selectedBy == _user.uid) {
                        socketRotationEmission(
                            details, DrawingState.move, actionId);
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
                case "select":
                  if (selectedItems.containsValue(_user.uid)) {
                    selectedItems.forEach((actionId, selectedBy) {
                      if (selectedBy == _user.uid) {
                        allowResize = false;
                      }
                    });
                  }
                  break;
                case "rotate":
                  if (selectedItems.containsValue(_user.uid)) {
                    selectedItems.forEach((actionId, selectedBy) {
                      if (selectedBy == _user.uid) {
                        socketRotationEmission(
                            details, DrawingState.up, actionId);
                      }
                    });
                  }
                  break;
              }
            },
            child: Container(
              color: currentBackgroundColor,
              child: CustomPaint(
                painter: Painter(drawType, paintsMap, actionsMap, selectedItems,
                    _user, setSelectedBounds),
                child: SizedBox(
                  height: MediaQuery.of(context).size.height,
                  width: MediaQuery.of(context).size.width,
                ),
              ),
            ),
          ))
        ]),
        floatingActionButton: Visibility(
          visible: selectedItems.containsValue(_user.uid),
          child: Stack(
            children: <Widget>[
              Align(
                alignment: Alignment.topRight,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(0, 80.0, 80.0, 0),
                  child: FloatingActionButton(
                      onPressed: () {
                        print("undo");
                      },
                      child: const Icon(Icons.undo)),
                ),
              ),
              Align(
                alignment: Alignment.topRight,
                child: Padding(
                  padding: const EdgeInsets.only(top: 80.0),
                  child: FloatingActionButton(
                      onPressed: () {
                        print("redo");
                      },
                      child: const Icon(Icons.redo)),
                ),
              ),
              Align(
                  alignment: Alignment.bottomRight,
                  child: FloatingActionButton(
                    onPressed: () => setState(() {
                      // TODO: All actions need to be saved for undo redo
                      var selectedItem = selectedItems.entries.firstWhere(
                          (selectedItem) => selectedItem.value == _user.uid);
                      var actionId = selectedItem.key;
                      socketDeleteEmission(actionId);
                    }),
                    tooltip: 'Supression',
                    child: const Icon(CupertinoIcons.archivebox_fill),
                    backgroundColor: kErrorColor,
                  )),
            ],
          ),
        ));
  }

  void unselectLastShape() {
    if (selectedItems.containsKey(lastShapeID) &&
        selectedItems[lastShapeID] == _user.uid) {
      socketSelectionEmission(lastShapeID!, false);
      selectedItems.remove(lastShapeID);
    }
  }

  void setSelectedBounds(List<Rect> bounds) {
    selectedBounds = bounds;
  }

  bool hasSelectedBounds(details) {
    bool hasSelectedBound = false;
    for (int i = 0; i < selectedBounds!.length; i++) {
      if (selectedBounds![i].contains(details.localPosition)) {
        hasSelectedBound = true;
        selectedBoundIndex = i;
      }
    }
    return hasSelectedBound;
  }

  void changeColor(Color color, String type) {
    switch (type) {
      case "Body":
        setState(() => currentBodyColor = color);
        break;
      case "Border":
        setState(() => currentBorderColor = color);
        break;
      case "Background":
        setState(() => currentBackgroundColor = color);
        break;
    }
  }

  void changeTool(String type) {
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
            var path = actionMap.values.first as Path;
            Matrix4 matrix4 = Matrix4.translationValues(
                data['xTranslation'].toDouble(),
                data['yTranslation'].toDouble(),
                0);
            actionMap.update(actionsMap[actionId].keys.first,
                (value) => path.transform(matrix4.storage));
            actionsMap.update(
                data['actionId'], (value) => actionMap as Map<String, Path>);
          }
        });
      });
    });
  }

  void socketRotationReception() {
    _socket.on('rotation:received', (data) {
      setState(() {
        if (data['state'] == DrawingState.down) {
          List<Offset> points = <Offset>[];
          points.add(Offset(data['x'], data['y']));
          selectPoints.putIfAbsent(
              selectedItems[data['actionId']], () => points);
        } else if (data['state'] == DrawingState.move) {
          Path actionPath = actionsMap[data["actionId"]].values.first;
          Offset center = actionPath.getBounds().center;
          var angle = atan2(data['y'] - center.dy, data['x'] - center.dx);
          var angleRef = atan2(selectPoints[data['userId']].last.dy - center.dy,
              selectPoints[data['userId']].last.dx - center.dx);
          var angleVariation = angle - angleRef;
          Matrix4 matriceRotation = Matrix4.rotationZ(angleVariation);
          actionPath = actionPath.transform(matriceRotation.storage);
          Offset newCenter = actionPath.getBounds().center;
          Matrix4 matriceTranslation = Matrix4.translationValues(
              (center - newCenter).dx, (center - newCenter).dy, 0);
          actionPath = actionPath.transform(matriceTranslation.storage);
          actionsMap[data["actionId"]].update(
              actionsMap[data["actionId"]].keys.first, (value) => actionPath);
          selectPoints[data['userId']]
              .add(Offset(data['x'].toDouble(), data['y'].toDouble()));
        } else {
          selectPoints.remove(data['userId']);
        }
      });
    });
  }

  // todo: faire que la sélection soit un peu plus grande que la forme
  // todo: le resize au coter opposer -> voir les corners value (vraiment elever dans le print ce qui cause erreur)
  // todo: put switch cases in a util class
  void socketResizeReception(
      String id, Offset currentPosition, Offset previousPosition) {
    setState(() {
      selectedItems.forEach((actionId, selectedBy) {
        if (selectedBy == _user.uid) {
          double xDelta = (currentPosition - previousPosition).dx * 0.32;
          double yDelta = (currentPosition - previousPosition).dy * 0.32;
          switch (selectedBoundIndex) {
            case 0:
              xDelta *= -1;
              break;
            case 1:
              xDelta *= 0;
              break;
            case 2:
              break;
            case 3:
              yDelta *= 0;
              break;
            case 4:
              yDelta *= -1;
              break;
            case 5:
              yDelta *= -1;
              xDelta *= 0;
              break;
            case 6:
              yDelta *= -1;
              xDelta *= -1;
              break;
            case 7:
              yDelta *= 0;
              xDelta *= -1;
              break;
          }
          // print("topRight: " + selectedBounds![2].center.dx.toString());
          // print("topLeftX: " + selectedBounds![0].center.dx.toString());
          // print("topLeftY: " + selectedBounds![0].center.dy.toString());
          // print("bottomLeft: " + selectedBounds![6].center.dy.toString());
          Offset oldRectBox = Offset(
              selectedBounds![2].center.dx - selectedBounds![0].center.dx,
              selectedBounds![0].center.dy - selectedBounds![6].center.dy);
          double xScale;
          double yScale;
          oldRectBox.dx == 0
              ? xScale = 1.0
              : xScale = (oldRectBox.dx + xDelta) / oldRectBox.dx;
          oldRectBox.dy == 0
              ? yScale = 1.0
              : yScale = (oldRectBox.dy + yDelta) / oldRectBox.dy;

          // TODO: change to data[actionId]
          Path actionPath = actionsMap[actionId].values.first;
          Matrix4 matrix = Matrix4.identity();
          matrix.scale(xScale, yScale);
          Path scaledPath = actionPath.transform(matrix.storage);

          // Translate to original position
          Offset newCenter = scaledPath.getBounds().center;
          vec.Vector3 translation = vec.Vector3(
              (initialResizeCenter - newCenter).dx,
              (initialResizeCenter - newCenter).dy,
              0);
          matrix.setTranslation(translation);
          scaledPath = scaledPath.transform(matrix.storage);

          // Translate to match bound position
          Offset corner = scaledPath.getBounds().center;
          switch (selectedBoundIndex) {
            case 0:
              corner = scaledPath.getBounds().topLeft;
              break;
            case 1:
              corner = scaledPath.getBounds().topCenter;
              break;
            case 2:
              corner = scaledPath.getBounds().topRight;
              break;
            case 3:
              corner = scaledPath.getBounds().centerRight;
              break;
            case 4:
              corner = scaledPath.getBounds().bottomRight;
              break;
            case 5:
              corner = scaledPath.getBounds().bottomCenter;
              break;
            case 6:
              corner = scaledPath.getBounds().bottomLeft;
              break;
            case 7:
              corner = scaledPath.getBounds().centerLeft;
              break;
          }
          vec.Vector3 translation2 = vec.Vector3(
              (corner - initialTapLocation).dx,
              (corner - initialTapLocation).dy,
              0);
          matrix.setTranslation(translation2);
          scaledPath = scaledPath.transform(matrix.storage);

          actionsMap[actionId]
              .update(actionsMap[actionId].keys.first, (value) => scaledPath);
        }
      });
    });
  }

  void socketShapeReception() {
    _socket.on('shape:received', (data) {
      setState(() {
        if (data['state'] == DrawingState.down) {
          Map map = <String, Path>{};
          Path path = Path();
          List<Offset> offsets = <Offset>[];
          offsets.add(Offset(data['x'].toDouble(), data['y'].toDouble()));
          shapesOffsets.putIfAbsent(data['actionId'], () => offsets);
          path.moveTo(data['x'].toDouble(), data['y'].toDouble());
          map.putIfAbsent(data['shapeType'], () => path);
          actionsMap.putIfAbsent(
              data['actionId'], () => map as Map<String, Path>);
          final paint = Paint()
            ..color = Color.fromARGB(data['a'] as int, data['r'] as int,
                data['g'] as int, data['b'] as int)
            ..isAntiAlias = true
            ..strokeWidth = data['width'].toDouble()
            ..style = (data['shapeStyle'] == "fill")
                ? PaintingStyle.fill
                : PaintingStyle.stroke;
          // todo: ajouter ici les attribus de couleur pour le fill
          paintsMap.putIfAbsent(data['actionId'], () => paint);
        } else if (data['state'] == DrawingState.move) {
          actionsMap.forEach((actionId, actionMap) {
            if (actionId == data['actionId']) {
              List<Offset> offsets = shapesOffsets[actionId];
              offsets.add(Offset(data['x'].toDouble(), data['y'].toDouble()));
              shapesOffsets.update(actionId, (value) => offsets);
              Rect rect = Rect.fromPoints(offsets.first, offsets.last);
              Map map = <String, Path>{};
              Path path = Path();
              if (data['shapeType'] == DrawingType.ellipse) {
                path.addOval(rect);
              } else {
                path.addRect(rect);
              }
              map.putIfAbsent(data['shapeType'], () => path);
              actionsMap.update(
                  data['actionId'], (value) => map as Map<String, Path>);
            }
          });
        } else {
          shapesOffsets.remove(data['actionId']);
        }
      });
    });
  }

  void socketFreedrawReception() {
    _socket.on('freedraw:received', (data) {
      setState(() {
        if (data['state'] == DrawingState.down) {
          Map map = <String, Path>{};
          Path path = Path();
          path.moveTo(data['x'].toDouble(), data['y'].toDouble());
          path.lineTo(data['x'].toDouble() + 1, data['y'].toDouble());
          map.putIfAbsent(DrawingType.freedraw, () => path);
          actionsMap.putIfAbsent(
              data['actionId'], () => map as Map<String, Path>);
          final paint = Paint()
            ..color = Color.fromARGB(data['a'] as int, data['r'] as int,
                data['g'] as int, data['b'] as int)
            ..isAntiAlias = true
            ..strokeWidth = data['width'].toDouble()
            ..style = PaintingStyle.stroke;
          paintsMap.putIfAbsent(data['actionId'], () => paint);
        } else if (data['state'] == DrawingState.move) {
          actionsMap.forEach((actionId, actionMap) {
            if (actionId == data['actionId']) {
              actionMap[DrawingType.freedraw]
                  .lineTo(data['x'].toDouble(), data['y'].toDouble());
              actionsMap.update(
                  data['actionId'], (value) => actionMap as Map<String, Path>);
            }
          });
        }
      });
    });
  }

  void socketDeleteReception() {
    _socket.on('delete:received', (data) {
      setState(() {
        actionsMap.remove(data["actionId"]);
        selectedItems.remove(data["actionId"]);
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

  void socketTranslationEmission(String selectItem, double xTranslation,
      double yTranslation, String drawingState) {
    _socket.emit("translation:emit", {
      'actionId': selectItem,
      'username': _user.displayName,
      'userId': _user.uid,
      'state': drawingState,
      'collaborationId': "DEMO_COLLABORATION",
      'actionType': "Translate",
      'xTranslation': xTranslation,
      'yTranslation': yTranslation
    });
  }

  void socketDeleteEmission(actionId) {
    _socket.emit('delete:emit', {
      'actionId': actionId,
      'username': _user.displayName,
      'userId': _user.uid,
      'collaborationId': "DEMO_COLLABORATION",
      'actionType': 'Delete',
    });
  }

  void socketRotationEmission(
      var details, String drawingState, String actionId) {
    _socket.emit('rotation:emit', {
      'actionId': actionId,
      'state': drawingState,
      'x': (drawingState == DrawingState.up)
          ? endPoint.dx
          : details.localPosition.dx,
      'y': (drawingState == DrawingState.up)
          ? endPoint.dy
          : details.localPosition.dy,
      'username': _user.displayName,
      'userId': _user.uid,
      'collaborationId': "DEMO_COLLABORATION",
    });
  }

  void socketShapeEmission(
      var details, String drawingType, String drawingState) {
    _socket.emit("shape:emit", {
      'actionId': (drawingState == DrawingState.down)
          ? shapeID = const Uuid().v1()
          : shapeID,
      'username': _user.displayName,
      'userId': _user.uid,
      'collaborationId': "DEMO_COLLABORATION",
      'actionType': 'Shape',
      'state': drawingState, // move/down/up
      'isSelected': (drawingState == DrawingState.up) ? "false" : true,
      'x': (drawingState == DrawingState.up)
          ? endPoint.dx
          : details.localPosition.dx,
      'y': (drawingState == DrawingState.up)
          ? endPoint.dy
          : details.localPosition.dy,
      'a': currentBodyColor.alpha,
      'r': currentBodyColor.red,
      'g': currentBodyColor.green,
      'b': currentBodyColor.blue,
      'x2': (drawingState == DrawingState.up)
          ? shapesOffsets[shapeID].last.dx
          : null,
      'y2': (drawingState == DrawingState.up)
          ? shapesOffsets[shapeID].last.dy
          : null,
      // todo:ajouter les couleur de fill ici
      'rFill': 0,
      'gFill': 0,
      'bFill': 0,
      'aFill': 0,
      // todo:ajouter le width en bouton
      'width': 6,
      'shapeType': drawType,
      // todo: changer avec un bouton éventuellement
      'shapeStyle': "border" // border | fill | center
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
      'a': currentBodyColor.alpha,
      'r': currentBodyColor.red,
      'g': currentBodyColor.green,
      'b': currentBodyColor.blue,
      'width': 6,
      // TODO: ADD OFFSET FOR DATABASE SAVE
      // 'offset': (drawingState == DrawingState.up) ? actionsMap[]
      'isSelected': (drawingState == DrawingState.up) ? "false" : true,
      'actionId': (drawingState == DrawingState.down)
          ? shapeID = const Uuid().v1()
          : shapeID
    });
  }

  String? getSelectedId(Offset offset) {
    List<String> overlapItems = <String>[];
    actionsMap.forEach((actionId, actionMap) {
      (actionMap as Map<String, Path>).forEach((action, path) {
        if (action == DrawingType.freedraw) {
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
  Painter(this.drawType, this.paintsMap, this.actionsMap, this.selectedItems,
      this.user, this.setCornersCallback);

  Map paintsMap;
  String drawType;
  Map actionsMap;
  Map selectedItems;
  User user;
  Function setCornersCallback;

  @override
  void paint(Canvas canvas, Size size) {
    actionsMap.forEach((actionId, action) {
      action.forEach((toolType, path) {
        if (toolType == DrawingType.freedraw) {
          if ((path as Path).computeMetrics().first.length == 1) {
            Tangent? tangent =
                path.computeMetrics().first.getTangentForOffset(0);
            canvas.drawPoints(
                PointMode.points, [tangent!.position], paintsMap[actionId]);
          }
          canvas.drawPath(path, paintsMap[actionId]);
        }
        if (toolType == DrawingType.ellipse ||
            toolType == DrawingType.rectangle) {
          canvas.drawPath(path, paintsMap[actionId]);
        }
        if (selectedItems.containsKey(actionId)) {
          var corners = getSelectionBoundingRect(
              actionsMap[actionId].values.first, actionId, setCornersCallback);
          canvas.drawPath(corners["path"], corners["paint"]);
        }
      });
    });
  }

  // todo: faire que la sélection soit un peu plus grande que la forme
  Map getSelectionBoundingRect(
      Path dragPath, String actionId, Function setCornersCallback) {
    Rect bounds = dragPath.getBounds();

    Path pathCorner = Path();
    Path pathBorder = Path();

    double width = 15.0;
    double height = 15.0;
    List<Offset> boundingRects = [
      bounds.topLeft,
      Offset(bounds.topLeft.dx + (bounds.topRight.dx - bounds.topLeft.dx) / 2,
          bounds.topLeft.dy),
      bounds.topRight,
      Offset(
          bounds.topRight.dx,
          bounds.bottomRight.dy +
              (bounds.topRight.dy - bounds.bottomRight.dy) / 2),
      bounds.bottomRight,
      Offset(
          bounds.bottomLeft.dx + (bounds.topRight.dx - bounds.topLeft.dx) / 2,
          bounds.bottomRight.dy),
      bounds.bottomLeft,
      Offset(
          bounds.bottomLeft.dx,
          bounds.bottomLeft.dy +
              (bounds.topLeft.dy - bounds.bottomLeft.dy) / 2),
    ];
    List<Rect> cornerRects = [];

    for (int i = 0; i < boundingRects.length; i++) {
      // rectangles
      Rect rect = Rect.fromCenter(
          center: boundingRects[i], width: width, height: height);

      pathCorner.addRect(rect);
      cornerRects.add(rect);

      // lines between rectangles
      if (i == boundingRects.length - 1) {
        pathBorder.moveTo(boundingRects[i].dx, boundingRects[i].dy);
        pathBorder.lineTo(boundingRects[0].dx, boundingRects[0].dy);
      } else {
        pathBorder.moveTo(boundingRects[i].dx, boundingRects[i].dy);
        pathBorder.lineTo(boundingRects[i + 1].dx, boundingRects[i + 1].dy);
      }
    }

    // dashed lines
    Path dashPath = Path();
    double dashWidth = 10.0;
    double dashSpace = 7.0;
    for (PathMetric pathMetric in pathBorder.computeMetrics()) {
      double distance = 0.0;
      while (distance < pathMetric.length) {
        dashPath.addPath(
          pathMetric.extractPath(distance, distance + dashWidth),
          Offset.zero,
        );
        distance += dashWidth;
        distance += dashSpace;
      }
    }

    if (selectedItems[actionId] == user.uid) {
      setCornersCallback(cornerRects);
    }

    pathCorner.addPath(dashPath, Offset.zero);

    final paint = Paint()
      ..color = Colors.black
      ..isAntiAlias = true
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke;

    return {"path": pathCorner, "paint": paint};
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
