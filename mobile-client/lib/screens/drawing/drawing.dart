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
  Color currentBackgroundColor = Colors.blueGrey;
  double currentWidth = 5;
  String currentFillType = "border";
  List<Rect>? selectedBounds;
  int? selectedBoundIndex;
  bool allowResize = false;

  //todo: doit géré ne modification d'un autre user. maybe delete tout les ref
  List<ShapeAction> undoList = [];
  List<ShapeAction> redoList = [];

  _DrawingScreenState(this._socket, this._user);

  @override
  void initState() {
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
      body: Row(
        children: [
          SizedBox(
              width: 100, child: Toolbar(changeTool, changeColor, changeWidth)),
          Flexible(
            child: Container(
              color: currentBackgroundColor,
              child: GestureDetector(
                child: CustomPaint(
                  painter: Painter(drawType, actionsMap, selectedItems, _user,
                      setSelectedBounds),
                  size: Size(
                    MediaQuery.of(context).size.width,
                    MediaQuery.of(context).size.height,
                  ),
                ),
                onPanStart: (details) {
                  switch (drawType) {
                    case DrawingType.freedraw:
                      socketFreedrawEmission(
                          details, DrawingState.down, false, "");
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
                    //  todo: prevent translation and resize to move in the
                  //   toolbar
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
                        if (hasSelectedBounds(details) &&
                            actionToRemove == "") {
                          allowResize = true;
                          socketResizeEmission(DrawingState.down, lastShapeID!,
                              details.localPosition, selectRef!);
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
                            ShapeAction shapeAction = actionsMap[actionId];
                            List<Offset> points = <Offset>[];
                            points.add(Offset(details.localPosition.dx,
                                details.localPosition.dy));
                            shapeAction.shapesOffsets = points;
                            actionsMap.update(actionId, (value) => shapeAction);
                          }
                        });
                      }
                      break;
                  }
                },
                //todo: changer les unselect juste en received
                onPanUpdate: (details) {
                  switch (drawType) {
                    case DrawingType.freedraw:
                      if (details.localPosition.dx > 0) {
                        socketFreedrawEmission(
                            details, DrawingState.move, false, "");
                      }
                      break;
                    case DrawingType.rectangle:
                      if (details.localPosition.dx > 0) {
                        unselectLastShape();
                        socketShapeEmission(
                            details, DrawingType.rectangle, DrawingState.move);
                      }
                      break;
                    case DrawingType.ellipse:
                      if (details.localPosition.dx > 0) {
                        unselectLastShape();
                        socketShapeEmission(
                            details, DrawingType.ellipse, DrawingState.move);
                      }
                      break;
                    case "select":
                      if (allowResize &&
                          selectedItems.containsValue(_user.uid)) {
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
                                DrawingState.move,
                                false);
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
                                details, DrawingState.move, actionId, false);
                            ShapeAction shapeAction = actionsMap[actionId];
                            shapeAction.shapesOffsets!.add(Offset(
                                details.localPosition.dx,
                                details.localPosition.dy));
                            actionsMap.update(actionId, (value) => shapeAction);
                          }
                        });
                      }
                      break;
                  }
                },
                onPanEnd: (details) {
                  switch (drawType) {
                    case DrawingType.freedraw:
                      socketFreedrawEmission(
                          endPoint, DrawingState.up, false, "");
                      lastShapeID = shapeID;
                      break;
                    case DrawingType.rectangle:
                      socketShapeEmission(
                          details, DrawingType.rectangle, DrawingState.up);
                      ShapeAction shapeAction = actionsMap[shapeID];
                      undoList.add(shapeAction.copy());
                      lastShapeID = shapeID;
                      break;
                    case DrawingType.ellipse:
                      socketShapeEmission(
                          details, DrawingType.ellipse, DrawingState.up);
                      ShapeAction shapeAction = actionsMap[shapeID];
                      undoList.add(shapeAction.copy());
                      lastShapeID = shapeID;
                      break;
                    case "select":
                      if (selectedItems.containsValue(_user.uid)) {
                        selectedItems.forEach((actionId, selectedBy) {
                          if (selectedBy == _user.uid) {
                            allowResize = false;
                            ShapeAction shapeAction = actionsMap[actionId];
                            undoList.add(shapeAction.copy());
                            shapeAction.translate = Offset.zero;
                            socketResizeEmission(DrawingState.up, actionId,
                                Offset.zero, Offset.zero);
                          }
                        });
                      }
                      break;
                    case "rotate":
                      if (selectedItems.containsValue(_user.uid)) {
                        selectedItems.forEach((actionId, selectedBy) {
                          if (selectedBy == _user.uid) {
                            //clear the list at the end
                            ShapeAction shapeAction = actionsMap[actionId];
                            shapeAction.shapesOffsets!.clear();
                            undoList.add(shapeAction.copy());
                            shapeAction.angle = 0;
                            actionsMap.update(actionId, (value) => shapeAction);
                          }
                        });
                      }
                      break;
                  }
                },
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: Stack(
        children: <Widget>[
          Align(
            alignment: Alignment.topLeft,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(150.0, 80.0, 0, 0),
              child: Visibility(
                visible: selectedItems.containsValue(_user.uid),
                child: FloatingActionButton(
                    onPressed: () {
                      setState(() {
                        drawType = "rotate";
                      });
                    },
                    child: const Icon(Icons.rotate_left)),
              ),
            ),
          ),
          Align(
            alignment: Alignment.topRight,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(0, 80.0, 80.0, 0),
              child: Visibility(
                visible: undoList.isNotEmpty,
                child: FloatingActionButton(
                    onPressed: () {
                      setState(() {
                        undoActionChooser();
                        print("undo");
                      });
                    },
                    child: const Icon(Icons.undo)),
              ),
            ),
          ),
          Align(
            alignment: Alignment.topRight,
            child: Padding(
              padding: const EdgeInsets.only(top: 80.0),
              child: Visibility(
                visible: redoList.isNotEmpty,
                child: FloatingActionButton(
                    onPressed: () {
                      redoActionChooser();
                      print("redo");
                    },
                    child: const Icon(Icons.redo)),
              ),
            ),
          ),
          Align(
            alignment: Alignment.bottomRight,
            child: Visibility(
              visible: selectedItems.isNotEmpty,
              child: FloatingActionButton(
                onPressed: () => setState(() {
                  // TODO: add this in undo
                  var selectedItem = selectedItems.entries.firstWhere(
                      (selectedItem) => selectedItem.value == _user.uid);
                  var actionId = selectedItem.key;
                  socketDeleteEmission(actionId);
                }),
                tooltip: 'Supression',
                child: const Icon(CupertinoIcons.archivebox_fill),
                backgroundColor: kErrorColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  //todo: doit retirer une sélection si jamais un selected item est delete
  void undoActionChooser() {
    ShapeAction undoAction = undoList.removeLast();
    redoList.add(undoAction);
    selectedItems.removeWhere((actionId, userId) => userId == _user.uid);
    if (undoAction.angle != 0) {
      socketRotationEmission(
          -undoAction.angle, DrawingState.move, undoAction.actionId, true);
    } else if (undoAction.translate != Offset.zero) {
      socketTranslationEmission(undoAction.actionId, -undoAction.translate.dx,
          -undoAction.translate.dy, DrawingState.move, true);
    } else {
      socketDeleteEmission(undoAction.actionId);
    }
  }

  void redoActionChooser() {
    ShapeAction redoAction = redoList.removeLast();
    undoList.add(redoAction);
    if (redoAction.angle != 0) {
      socketRotationEmission(
          redoAction.angle, DrawingState.move, redoAction.actionId, true);
    } else if (redoAction.translate != Offset.zero) {
      socketTranslationEmission(redoAction.actionId, redoAction.translate.dx,
          redoAction.translate.dy, DrawingState.move, true);
      //  todo: freedraw doit send la liste de point onUp et gerer en concéquence
    } else if (redoAction.actionType == "Freedraw") {
      for (int i = 0; i < redoAction.shapesOffsets!.length; i++) {
        if (i == 0) {
          socketFreedrawEmission(
              Offset(redoAction.shapesOffsets!.elementAt(i).dx,
                  redoAction.shapesOffsets!.elementAt(i).dy),
              DrawingState.down,
              true,
              redoAction.actionId);
        } else {
          socketFreedrawEmission(
              Offset(redoAction.shapesOffsets!.elementAt(i).dx,
                  redoAction.shapesOffsets!.elementAt(i).dy),
              DrawingState.move,
              true,
              redoAction.actionId);
        }
      }
    }
  }

  void unselectLastShape() {
    List<String> toRemove = [];
    selectedItems.forEach((actionId, userId) {
      if (userId == _user.uid && actionId != shapeID) {
        toRemove.add(actionId);
      }
    });
    for (var actionIdToRemove in toRemove) {
      socketSelectionEmission(actionIdToRemove, false);
      selectedItems.remove(actionIdToRemove);
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

  void changeWidth(double width) {
    setState(() => currentWidth = width);
  }

  void changeTool(String type, String fillType) {
    if (drawType == DrawingType.rectangle || drawType == DrawingType.ellipse) {
      currentFillType = fillType;
    }
    setState(() {
      drawType = type;
    });
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
        if (data['state'] == DrawingState.move) {
          Path actionPath = actionsMap[data['selectedActionId']].path;
          Offset center = actionPath.getBounds().center;

          //transform path with matrix of rotation
          Matrix4 matriceRotation = Matrix4.rotationZ(data['angle'].toDouble());
          actionPath = actionPath.transform(matriceRotation.storage);

          //transform path with matrix of translation
          Offset newCenter = actionPath.getBounds().center;
          Matrix4 matriceTranslation = Matrix4.translationValues(
              (center - newCenter).dx, (center - newCenter).dy, 0);
          actionPath = actionPath.transform(matriceTranslation.storage);

          //update map
          ShapeAction shapeAction = actionsMap[data['selectedActionId']];
          shapeAction.path = actionPath;
          actionsMap.update(data['selectedActionId'], (value) => shapeAction);
        }
      });
    });
  }

  double calculateAngleVariation(String actionId, Offset currentOffset) {
    Path actionPath = actionsMap[actionId].path;
    Offset center = actionPath.getBounds().center;

    var angle =
        atan2(currentOffset.dy - center.dy, currentOffset.dx - center.dx);

    var angleRef = atan2(actionsMap[actionId].shapesOffsets.last.dy - center.dy,
        actionsMap[actionId].shapesOffsets.last.dx - center.dx);
    var angleVariation = angle - angleRef;
    actionsMap[actionId].angle += angleVariation;
    return angleVariation;
  }

  void socketResizeReception() {
    _socket.on('resize:received', (data) {
      setState(() {
        selectedItems.forEach((actionId, selectedBy) {
          if (data['selectedActionId'] == actionId) {
            if (data['state'] == DrawingState.down) {
              actionsMap[actionId].oldShape = actionsMap[actionId].path;
            } else if (data['state'] == DrawingState.move) {
              Path actionPath = actionsMap[actionId].oldShape;

              Matrix4 matrixTranslation;
              matrixTranslation = Matrix4.translationValues(
                  -data['xTranslation'].toDouble(),
                  -data['yTranslation'].toDouble(),
                  0);
              Path scaledPath = actionPath.transform(matrixTranslation.storage);

              Matrix4 matrixScale = Matrix4.identity();
              matrixScale.scale(
                  data['xScale'].toDouble(), data['yScale'].toDouble());
              scaledPath = scaledPath.transform(matrixScale.storage);

              // // Translate to match fix corner position
              Matrix4 matrixTranslation2;
              matrixTranslation2 = Matrix4.translationValues(
                  data['xTranslation'].toDouble(),
                  data['yTranslation'].toDouble(),
                  0);
              scaledPath = scaledPath.transform(matrixTranslation2.storage);

              // Save the scaled path
              ShapeAction shapeAction = actionsMap[actionId];
              shapeAction.path = scaledPath;
              actionsMap.update(actionId, (value) => shapeAction);
            } else if (data['state'] == DrawingState.up) {
              actionsMap[actionId].delta = Offset.zero;
            }
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

          ShapeAction shapeAction = ShapeAction(
              Path(), data['shapeType'], paintBorder, data['actionId']);

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
          unselectLastShape();
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
              ShapeAction(path, data['actionType'], paint, data['actionId']);
          shapeAction.shapesOffsets = [
            Offset(data['x'].toDouble(), data['y'].toDouble())
          ];
          actionsMap.putIfAbsent(data['actionId'], () => shapeAction);
        } else if (data['state'] == DrawingState.move) {
          unselectLastShape();
          actionsMap.forEach((actionId, shapeAction) {
            //Get the action
            if (actionId == data['actionId']) {
              shapeAction.path
                  .lineTo(data['x'].toDouble(), data['y'].toDouble());

              shapeAction.shapesOffsets += [
                Offset(data['x'].toDouble(), data['y'].toDouble())
              ];

              //Update the action
              actionsMap.update(
                  data['actionId'], (value) => shapeAction as ShapeAction);
            }
          });
        } else if (data['state'] == DrawingState.up &&
            _user.uid == data['userId']) {
          unselectLastShape();
          ShapeAction shapeAction = actionsMap[data['actionId']];
          undoList.add(shapeAction.copy());
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
        'collaborationId': "fa0cab93-b571-4db4-8467-1bef5cbffbb4",
        'actionType': "Select",
        'isSelected': true,
        'isUndoRedo': false,
      });
    });
  }

  void socketException() {
    _socket.on('drawing:exception', (data) {
      print(data);
      print("");
    });
  }

  void socketSelectionEmission(String selectItem, bool isSelected) {
    _socket.emit("selection:emit", {
      'actionId': selectItem,
      'username': _user.displayName,
      'userId': _user.uid,
      'collaborationId': "fa0cab93-b571-4db4-8467-1bef5cbffbb4",
      'actionType': "Select",
      'isSelected': isSelected,
    });
  }

  void socketTranslationEmission(String selectItem, double xTranslation,
      double yTranslation, String drawingState, bool isUndo) {
    if (!isUndo) {
      actionsMap[selectItem].translate += Offset(xTranslation, yTranslation);
    }
    _socket.emit("translation:emit", {
      'actionId': selectItem,
      'selectedActionId': selectItem,
      'username': _user.displayName,
      'userId': _user.uid,
      'state': drawingState,
      'collaborationId': "fa0cab93-b571-4db4-8467-1bef5cbffbb4",
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
      'collaborationId': "fa0cab93-b571-4db4-8467-1bef5cbffbb4",
      'actionType': 'Delete',
    });
  }

  void socketRotationEmission(
      var details, String drawingState, String actionId, bool isUndo) {
    _socket.emit('rotation:emit', {
      'actionId': actionId,
      'selectedActionId': actionId,
      'actionType': "Rotate",
      'state': drawingState,
      'angle': (isUndo)
          ? details
          : calculateAngleVariation(actionId,
              Offset(details.localPosition.dx, details.localPosition.dy)),
      'username': _user.displayName,
      'userId': _user.uid,
      'collaborationId': "fa0cab93-b571-4db4-8467-1bef5cbffbb4",
    });
  }

  void socketResizeEmission(String drawingState, String actionId,
      Offset currentPosition, Offset previousPosition) {
    Bounds bounds = Bounds();
    Offset varDelta = currentPosition - previousPosition;
    if (drawingState == DrawingState.down) {
      actionsMap[actionId].oldShape = actionsMap[actionId].path;
    } else if (drawingState == DrawingState.move) {
      bounds.setResizeData(actionsMap, actionId, selectedBoundIndex!, varDelta);
    }

    _socket.emit('resize:emit', {
      'actionId': actionId,
      'actionType': "Resize",
      'selectedActionId': actionId,
      'username': _user.displayName,
      'userId': _user.uid,
      'collaborationId': "fa0cab93-b571-4db4-8467-1bef5cbffbb4",
      'xScale':
          (drawingState == DrawingState.move) ? bounds.xScale : 1.toDouble(),
      'yScale':
          (drawingState == DrawingState.move) ? bounds.yScale : 1.toDouble(),
      'xTranslation':
          (drawingState == DrawingState.move) ? bounds.xTranslation : 0,
      'yTranslation':
          (drawingState == DrawingState.move) ? bounds.yTranslation : 0,
      'state': drawingState,
    });
  }

  //todo: tous les emit de selection doivent avoir : selectedActionId
  void socketShapeEmission(
      var details, String drawingType, String drawingState) {
    _socket.emit("shape:emit", {
      'actionId': (drawingState == DrawingState.down)
          ? shapeID = const Uuid().v1()
          : shapeID,
      'username': _user.displayName,
      'userId': _user.uid,
      'collaborationId': "fa0cab93-b571-4db4-8467-1bef5cbffbb4",
      'actionType': 'Shape',
      'state': drawingState, // move/down/up
      'isSelected': (drawingState == DrawingState.up) ? false : true,
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
      'width': currentWidth,
      'shapeType': drawType,
      // todo: changer avec un bouton éventuellement
      'shapeStyle': currentFillType, // border | fill | center
    });
  }

  void socketFreedrawEmission(
      var details, String drawingState, bool isRedo, String actionId) {
    if (actionId != "") {
      shapeID = actionId;
    }
    _socket.emit("freedraw:emit", {
      'x': (isRedo || drawingState == DrawingState.up)
          ? details.dx
          : details.localPosition.dx.toInt(),
      'y': (isRedo || drawingState == DrawingState.up)
          ? details.dy
          : details.localPosition.dy.toInt(),
      'collaborationId': "fa0cab93-b571-4db4-8467-1bef5cbffbb4",
      'username': _user.displayName,
      'userId': _user.uid,
      'actionType': "Freedraw",
      'state': drawingState,
      'a': currentBorderColor.alpha,
      'r': currentBorderColor.red,
      'g': currentBorderColor.green,
      'b': currentBorderColor.blue,
      'width': currentWidth,
      // TODO: ADD OFFSET FOR DATABASE SAVE
      // 'offset': (drawingState == DrawingState.up) ? actionsMap[]
      'isSelected': (drawingState == DrawingState.up) ? false : true,
      'actionId': (drawingState == DrawingState.down && !isRedo)
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
        if (selectedItems.containsKey(actionId) &&
            selectedItems[actionId] == user.uid) {
          //if it's my selection we put borders

          if (shapeAction.path.computeMetrics().first.length <= 1) {
            Tangent? tangent = shapeAction.path
                .computeMetrics()
                .first
                .getTangentForOffset(0.toDouble());
            canvas.drawPoints(
                PointMode.points, [tangent!.position], shapeAction.borderColor);
          } else {
            canvas.drawPath(shapeAction.path, shapeAction.borderColor);
          }
          var corners = getSelectionBoundingRect(
              shapeAction.path, actionId, setCornersCallback);
          canvas.drawPath(corners["path"], corners["paint"]);
        } else if (selectedItems.containsKey(actionId)) {
          //if it's someone else selection we put opacity
          shapeAction.borderColor.color =
              shapeAction.borderColor.color.withOpacity(0.3);

          if (shapeAction.path.computeMetrics().first.length == 1) {
            Tangent? tangent = shapeAction.path
                .computeMetrics()
                .first
                .getTangentForOffset(0.toDouble());
            canvas.drawPoints(
                PointMode.points, [tangent!.position], shapeAction.borderColor);
          } else {
            canvas.drawPath(shapeAction.path, shapeAction.borderColor);
          }
        } else {
          shapeAction.borderColor.color =
              shapeAction.borderColor.color.withOpacity(1.0);

          //Draw a point if their is only one click
          if (shapeAction.path.computeMetrics().first.length == 1) {
            Tangent? tangent = shapeAction.path
                .computeMetrics()
                .first
                .getTangentForOffset(0.toDouble());
            canvas.drawPoints(
                PointMode.points, [tangent!.position], shapeAction.borderColor);
          } else {
            canvas.drawPath(shapeAction.path, shapeAction.borderColor);
          }
        }
      }
      if (shapeAction.actionType == DrawingType.ellipse ||
          shapeAction.actionType == DrawingType.rectangle) {
        if (selectedItems.containsKey(actionId) &&
            selectedItems[actionId] == user.uid) {
          //if it's my selection we put borders
          if (shapeAction.bodyColor != null) {
            canvas.drawPath(shapeAction.path, shapeAction.bodyColor);
          }
          canvas.drawPath(shapeAction.path, shapeAction.borderColor);
          var corners = getSelectionBoundingRect(
              shapeAction.path, actionId, setCornersCallback);
          canvas.drawPath(corners["path"], corners["paint"]);
        } else if (selectedItems.containsKey(actionId)) {
          //if it's someone else selection we put opacity
          if (shapeAction.bodyColor != null) {
            shapeAction.bodyColor.color =
                shapeAction.bodyColor.color.withOpacity(0.3);
            canvas.drawPath(shapeAction.path, shapeAction.bodyColor);
          }
          shapeAction.borderColor.color =
              shapeAction.borderColor.color.withOpacity(0.3);
          canvas.drawPath(shapeAction.path, shapeAction.borderColor);
        } else {
          if (shapeAction.bodyColor != null) {
            shapeAction.bodyColor.color =
                shapeAction.bodyColor.color.withOpacity(1.0);
            canvas.drawPath(shapeAction.path, shapeAction.bodyColor);
          }
          shapeAction.borderColor.color =
              shapeAction.borderColor.color.withOpacity(1.0);
          canvas.drawPath(shapeAction.path, shapeAction.borderColor);
        }
      }
    });
  }

  Map getSelectionBoundingRect(
      Path dragPath, String actionId, Function setCornersCallback) {
    Rect bounds = dragPath.getBounds();
    Path pathCorner = Path();
    Path pathBorder = Path();

    double width = (bounds.width == 1) ? 1.0 : 15;
    double height = (bounds.width == 1) ? 1.0 : 15;

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
