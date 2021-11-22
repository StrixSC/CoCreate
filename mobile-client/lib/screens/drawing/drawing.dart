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
  Map actionsMap = <String, ShapeAction>{};
  Map selectedItems = <String, String>{};
  bool allowMove = false;
  Offset? selectRef; // offset reference of selected item
  Color currentBodyColor = const Color(0xff443a49);
  Color currentBorderColor = const Color(0xff443a49);
  Color currentBackgroundColor =
      Colors.blueGrey; // todo: white doesnt show 'B' letter
  List<Rect>? selectedBounds;
  int? selectedBoundIndex;
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
    socketDeleteReception();
    socketResizeReception();
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
                  if (allowResize && selectedItems.containsValue(_user.uid)) {
                    selectedItems.forEach((actionId, selectedBy) {
                      if (selectedBy == _user.uid) {
                        socketResizeEmission(DrawingState.move, actionId,
                            details.localPosition, selectRef!);
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
                painter: Painter(drawType, actionsMap, selectedItems, _user,
                    setSelectedBounds),
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

  //todo: faire bcp de trait rapidement bypass cette méthode. il faudrait
  // faire comme a la sélection et retirer toute les ref a un userId
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
        if (data["state"] != DrawingState.up) {
          actionsMap.forEach((actionId, shapeAction) {
            if (actionId == data['actionId'] ||
                actionId == data['selectedActionId']) {
              Matrix4 matrix4 = Matrix4.translationValues(
                  data['xTranslation'].toDouble(),
                  data['yTranslation'].toDouble(),
                  0);
              shapeAction.path = shapeAction.path.transform(matrix4.storage);

              actionsMap.update(
                  actionId, (value) => shapeAction as ShapeAction);
            }
          });
        }
      });
    });
  }

  void socketRotationReception() {
    _socket.on('rotation:received', (data) {
      setState(() {
        if (data['state'] == DrawingState.down) {
          //create new List
          ShapeAction shapeAction = actionsMap[data['actionId']];
          List<Offset> points = <Offset>[];
          points.add(Offset(data['x'], data['y']));
          shapeAction.shapesOffsets = points;
          actionsMap.update(data['actionId'], (value) => shapeAction);
        } else if (data['state'] == DrawingState.move) {
          //get shape center
          Path actionPath = actionsMap[data["actionId"]].path;
          Offset center = actionPath.getBounds().center;

          //calcultae angle variation
          var angle = atan2(data['y'] - center.dy, data['x'] - center.dx);
          var angleRef = atan2(
              actionsMap[data['actionId']].shapesOffsets.last.dy - center.dy,
              actionsMap[data['actionId']].shapesOffsets.last.dx - center.dx);
          var angleVariation = angle - angleRef;

          //transform path with matrix of rotation
          Matrix4 matriceRotation = Matrix4.rotationZ(angleVariation);
          actionPath = actionPath.transform(matriceRotation.storage);

          //transform path with matrix of translation
          Offset newCenter = actionPath.getBounds().center;
          Matrix4 matriceTranslation = Matrix4.translationValues(
              (center - newCenter).dx, (center - newCenter).dy, 0);
          actionPath = actionPath.transform(matriceTranslation.storage);

          //update map
          ShapeAction shapeAction = actionsMap[data["actionId"]];
          shapeAction.path = actionPath;
          shapeAction.shapesOffsets!
              .add(Offset(data['x'].toDouble(), data['y'].toDouble()));
          actionsMap.update(data['actionId'], (value) => shapeAction);
        } else {
          //clear the list at the end
          ShapeAction shapeAction = actionsMap[data["actionId"]];
          shapeAction.shapesOffsets!.clear();
          actionsMap.update(data['actionId'], (value) => shapeAction);
        }
      });
    });
  }

  // todo: le resize au coter opposer -> voir les corners value (vraiment elever dans le print ce qui cause erreur)
  void socketResizeReception() {
    _socket.on('resize:received', (data) {
      setState(() {
        selectedItems.forEach((actionId, selectedBy) {
          if (actionId == data["actionId"]) {
            //Get the scaling of the output shape from the initShape
            Rect oldRect = actionsMap[actionId].values.first.getBounds();
            Bounds bounds = Bounds();
            double x = data["x2"] - data["x"];
            double y = data["y2"] - data["y"];
            Offset delta = bounds.getDeltaFactor(
                data["boundIndex"], x.toDouble(), y.toDouble());

            double xDelta = oldRect.width + delta.dx;
            double yDelta = oldRect.height + delta.dy;
            double xScale = xDelta / oldRect.width;
            double yScale = yDelta / oldRect.height;

            // Scale the path
            Path actionPath = actionsMap[actionId].values.first;
            Matrix4 matrixScale = Matrix4.identity();
            matrixScale.scale(xScale, yScale);
            Path scaledPath = actionPath.transform(matrixScale.storage);

            // Translate to match fix corner position
            Set corners = bounds.getCornerFromTransformedPath(
                data["boundIndex"], scaledPath, oldRect);
            Matrix4 matrixTranslation = Matrix4.translationValues(
                (corners.last - corners.first).dx,
                (corners.last - corners.first).dy,
                0);
            scaledPath = scaledPath.transform(matrixTranslation.storage);

            // Save the scaled path
            actionsMap[actionId]
                .update(actionsMap[actionId].keys.first, (value) => scaledPath);
          }
        });
      });
    });
  }

  void socketShapeReception() {
    _socket.on('shape:received', (data) {
      setState(() {
        if (data['state'] == DrawingState.down) {
          //Create new list of points to keep a track
          List<Offset> offsets = <Offset>[];
          offsets.add(Offset(data['x'].toDouble(), data['y'].toDouble()));

          //Create the paint for the border
          final paintBorder = Paint()
            ..color = Color.fromARGB(data['a'] as int, data['r'] as int,
                data['g'] as int, data['b'] as int)
            ..isAntiAlias = true
            ..strokeWidth = data['width'].toDouble()
            ..style = PaintingStyle.stroke;

          ShapeAction shapeAction =
              ShapeAction(Path(), data['shapeType'], paintBorder);

          // Create paint of the fill if there is one
          if (data['shapeStyle'] == "fill") {
            final paintFill = Paint()
              ..color = Color.fromARGB(
                  data['aFill'] as int,
                  data['rFill'] as int,
                  data['gFill'] as int,
                  data['bFill'] as int)
              ..isAntiAlias = true
              ..strokeWidth = data['width'].toDouble()
              ..style = PaintingStyle.fill;
            shapeAction.bodyColor = paintFill;
          }

          //Save the action and the offsets
          shapeAction.shapesOffsets = offsets;
          actionsMap.putIfAbsent(data['actionId'], () => shapeAction);
        } else if (data['state'] == DrawingState.move) {
          actionsMap.forEach((actionId, shapeAction) {
            //Find the action
            if (actionId == data['actionId']) {
              //Update list of points
              shapeAction.shapesOffsets
                  .add(Offset(data['x'].toDouble(), data['y'].toDouble()));

              //Contruct the shape
              Rect rect = Rect.fromPoints(shapeAction.shapesOffsets.first,
                  shapeAction.shapesOffsets.last);

              //Set the shape in the path
              Path path = Path();
              if (data['shapeType'] == DrawingType.ellipse) {
                path.addOval(rect);
              } else {
                path.addRect(rect);
              }
              shapeAction.path = path;

              actionsMap.update(
                  data['actionId'], (value) => shapeAction as ShapeAction);
            }
          });
        } else {
          //Clear the list of points
          ShapeAction shapeAction = actionsMap[data['actionId']];
          shapeAction.shapesOffsets!.clear();
          actionsMap.update(data['actionId'], (value) => shapeAction);
        }
      });
    });
  }

  void socketFreedrawReception() {
    _socket.on('freedraw:received', (data) {
      setState(() {
        if (data['state'] == DrawingState.down) {
          //Create new freedraw path
          Path path = Path();
          path.moveTo(data['x'].toDouble(), data['y'].toDouble());
          path.lineTo(data['x'].toDouble() + 1, data['y'].toDouble());

          //Create border color and style
          final paint = Paint()
            ..color = Color.fromARGB(data['a'] as int, data['r'] as int,
                data['g'] as int, data['b'] as int)
            ..isAntiAlias = true
            ..strokeWidth = data['width'].toDouble()
            ..style = PaintingStyle.stroke;

          //Merge attributes and save shape
          ShapeAction shapeAction =
              ShapeAction(path, data['actionType'], paint);
          actionsMap.putIfAbsent(data['actionId'], () => shapeAction);
        } else if (data['state'] == DrawingState.move) {
          actionsMap.forEach((actionId, shapeAction) {
            //Get the action
            if (actionId == data['actionId']) {
              shapeAction.path
                  .lineTo(data['x'].toDouble(), data['y'].toDouble());

              //Update the action
              actionsMap.update(
                  data['actionId'], (value) => shapeAction as ShapeAction);
            }
          });
        }
      });
    });
  }

  void socketDeleteReception() {
    _socket.on('delete:received', (data) {
      setState(() {
        actionsMap.remove(data["selectedActionId"]);
        selectedItems.remove(data["selectedActionId"]);
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
      'selectedActionId': selectItem,
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
      'selectedActionId': actionId,
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

  void socketResizeEmission(String drawingState, String actionId,
      Offset currentPosition, Offset previousPosition) {
    Offset oldRectBox = Offset(
        selectedBounds![2].center.dx - selectedBounds![0].center.dx,
        selectedBounds![0].center.dy - selectedBounds![6].center.dy);
    if (oldRectBox.dx != 0.0) {
      _socket.emit('resize:emit', {
        'actionId': actionId,
        'selectedActionId': actionId,
        'actionType': "Resize",
        'x': previousPosition.dx,
        'y': previousPosition.dy,
        'x2': currentPosition.dx,
        'y2': currentPosition.dy,
        'initialBoundX': initialTapLocation.dx,
        'initialBoundY': initialTapLocation.dy,
        'initialCenterX': initialResizeCenter.dx,
        'initialCenterY': initialResizeCenter.dy,
        'oldWidth': oldRectBox.dx,
        'oldHeight': oldRectBox.dy,
        'boundIndex': selectedBoundIndex,
        'username': _user.displayName,
        'userId': _user.uid,
        'collaborationId': "DEMO_COLLABORATION",
      });
    }
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
      'a': currentBorderColor.alpha,
      'r': currentBorderColor.red,
      'g': currentBorderColor.green,
      'b': currentBorderColor.blue,
      'x2': (drawingState == DrawingState.up)
          ? actionsMap[shapeID].shapesOffsets.last.dx
          : null,
      'y2': (drawingState == DrawingState.up)
          ? actionsMap[shapeID].shapesOffsets.last.dy
          : null,
      'rFill': currentBodyColor.red,
      'gFill': currentBodyColor.green,
      'bFill': currentBodyColor.blue,
      'aFill': currentBodyColor.alpha,
      // todo:ajouter le width en bouton
      'width': 10,
      'shapeType': drawType,
      // todo: changer avec un bouton éventuellement
      'shapeStyle': "fill" // border | fill | center
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
    actionsMap.forEach((actionId, shapeAction) {
      if (shapeAction.actionType == DrawingType.freedraw) {
        for (int i = 0;
            i < shapeAction.path.computeMetrics().first.length;
            i++) {
          Tangent? tangent = shapeAction.path
              .computeMetrics()
              .first
              .getTangentForOffset(i.toDouble());
          if ((tangent!.position - offset).distance.toInt() <=
              shapeAction.borderColor.strokeWidth / 2) {
            overlapItems.add(actionId);
          }
        }
      } else if (shapeAction.actionType == DrawingType.rectangle ||
          shapeAction.actionType == DrawingType.ellipse) {
        if (shapeAction.path.contains(offset)) {
          overlapItems.add(actionId);
        }
      }
    });
    if (overlapItems.isNotEmpty) {
      return overlapItems.last;
    }
    return null;
  }
}

class Painter extends CustomPainter {
  Painter(this.drawType, this.actionsMap, this.selectedItems, this.user,
      this.setCornersCallback);

  String drawType;
  Map actionsMap;
  Map selectedItems;
  User user;
  Function setCornersCallback;

  @override
  void paint(Canvas canvas, Size size) {
    actionsMap.forEach((actionId, shapeAction) {
      if (shapeAction.actionType == DrawingType.freedraw) {
        //Draw a point if their is only one click
        if (shapeAction.path.computeMetrics().first.length == 1) {
          Tangent? tangent = shapeAction.path
              .computeMetrics()
              .first
              .getTangentForOffset(0.toDouble());
          canvas.drawPoints(
              PointMode.points, [tangent!.position], shapeAction.borderColor);
        }

        //Draw a line
        canvas.drawPath(shapeAction.path, shapeAction.borderColor);
      }
      if (shapeAction.actionType == DrawingType.ellipse ||
          shapeAction.actionType == DrawingType.rectangle) {
        if (shapeAction.bodyColor != null) {
          canvas.drawPath(shapeAction.path, shapeAction.bodyColor);
        }
        canvas.drawPath(shapeAction.path, shapeAction.borderColor);
      }

      if (selectedItems.containsKey(actionId)) {
        var corners = getSelectionBoundingRect(
            shapeAction.path, actionId, setCornersCallback);
        canvas.drawPath(corners["path"], corners["paint"]);
      }
    });
  }

// todo: ne pas afficher les ancrages si c'est la sélection d'un autre
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
    if ((bounds.topRight.dx - bounds.topLeft.dx) != 0) {
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
