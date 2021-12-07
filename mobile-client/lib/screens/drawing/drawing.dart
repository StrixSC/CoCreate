import 'dart:math';
import 'dart:ui';

import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/drawing.dart';
import 'package:Colorimage/screens/drawing/toolbar.dart';
import 'package:Colorimage/widgets/sidebar.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:uuid/uuid.dart';

class DrawingScreen extends StatefulWidget {
  final io.Socket _socket;
  final User _user;
  final String _collaborationId;
  final Map _actions;
  final Map _selectedItems;

  const DrawingScreen(this._socket, this._user, this._collaborationId,
      this._actions, this._selectedItems);

  @override
  State<DrawingScreen> createState() => _DrawingScreenState(
      _socket, _user, _collaborationId, _actions, _selectedItems);
}

class _DrawingScreenState extends State<DrawingScreen> {
  final io.Socket _socket;
  final User _user;
  final String _collaborationId;
  Offset endPoint = const Offset(-1, -1);
  String drawType = DrawingType.freedraw;
  String? shapeID;
  String? selectionActionId;
  String? lastShapeID;
  Map actionsMap;
  Map selectedItems;
  bool allowMove = false;
  Offset? selectRef; // offset reference of selected item
  Color currentBodyColor = const Color(0xff443a49);
  Color currentBorderColor = const Color(0xff443a49);
  Color currentBackgroundColor = Colors.blueGrey;
  double currentWidth = 5;
  String currentFillType = "border";
  List<Rect> selectedBounds = [];
  int? selectedBoundIndex;
  bool allowResize = false;
  bool floatButtonPressed = false;
  double translateLimit = 0;
  Offset firstPoint = Offset.zero;
  bool hasOngoingMovement = false;

  List<ShapeAction> undoList = [];
  List<ShapeAction> redoList = [];

  _DrawingScreenState(this._socket, this._user, this._collaborationId,
      this.actionsMap, this.selectedItems);

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
      endDrawer: SizedBox(
          width: MediaQuery.of(context).size.width * 0.45, child: Sidebar()),
      body: Row(
        children: [
          SizedBox(
              width: 100,
              child: Toolbar(
                  changeTool, changeColor, changeWidth, unselectBeforeLeave)),
          Flexible(
            child: Container(
              color: currentBackgroundColor,
              child: GestureDetector(
                child: CustomPaint(
                  painter: Painter(drawType, actionsMap, selectedItems, _user,
                      setSelectedBounds, currentWidth),
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
                      socketShapeEmission(details, DrawingType.rectangle,
                          DrawingState.down, "", false);
                      break;
                    case DrawingType.ellipse:
                      socketShapeEmission(details, DrawingType.ellipse,
                          DrawingState.down, "", false);
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
                        if (hasSelectedBounds(details) &&
                            actionToRemove == "") {
                          allowResize = true;
                          socketResizeEmission(DrawingState.down, lastShapeID!,
                              details.localPosition, selectRef!, false, false);
                        }
                      }
                      if (selectItem != null &&
                          !selectedItems.containsKey(selectItem) &&
                          !hasSelectedBounds(details)) {
                        socketSelectionEmission(selectItem, true);
                        lastShapeID = selectItem;
                      } else {
                        allowMove = true;
                        if (selectItem != null) {
                          translateLimit = details.localPosition.dx -
                              actionsMap[selectItem].path.getBounds().left;
                        }
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
                        socketShapeEmission(details, DrawingType.rectangle,
                            DrawingState.move, "", false);
                      }
                      break;
                    case DrawingType.ellipse:
                      if (details.localPosition.dx > 0) {
                        socketShapeEmission(details, DrawingType.ellipse,
                            DrawingState.move, "", false);
                      }
                      break;
                    case "select":
                      if (allowResize &&
                          details.localPosition.dx > 0 &&
                          selectedItems.containsValue(_user.uid)) {
                        selectedItems.forEach((actionId, selectedBy) {
                          if (selectedBy == _user.uid) {
                            socketResizeEmission(
                                DrawingState.move,
                                actionId,
                                details.localPosition,
                                selectRef!,
                                false,
                                false);
                            selectRef = details.localPosition;
                          }
                        });
                      } else if (allowMove &&
                          selectedItems.containsValue(_user.uid)) {
                        selectedItems.forEach((actionId, selectedBy) {
                          if (selectedBy == _user.uid) {
                            if (details.localPosition.dx > translateLimit) {
                              socketTranslationEmission(
                                  actionId,
                                  (details.localPosition - selectRef!).dx,
                                  (details.localPosition - selectRef!).dy,
                                  DrawingState.move,
                                  false);
                              selectRef = details.localPosition;
                            }
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
                      socketShapeEmission(details, DrawingType.rectangle,
                          DrawingState.up, "", false);
                      lastShapeID = shapeID;
                      break;
                    case DrawingType.ellipse:
                      socketShapeEmission(details, DrawingType.ellipse,
                          DrawingState.up, "", false);
                      lastShapeID = shapeID;
                      break;
                    case "select":
                      if (selectedItems.containsValue(_user.uid)) {
                        selectedItems.forEach((actionId, selectedBy) {
                          if (selectedBy == _user.uid) {
                            allowResize = false;
                            ShapeAction shapeAction = actionsMap[actionId];
                            undoList.add(shapeAction.copy());
                            if (shapeAction.translate != Offset.zero) {
                              socketTranslationEmission(
                                  actionId,
                                  shapeAction.translate.dx,
                                  shapeAction.translate.dy,
                                  DrawingState.up,
                                  false);
                            }
                            shapeAction.translate = Offset.zero;
                            if (shapeAction.delta != Offset.zero) {
                              socketResizeEmission(DrawingState.up, actionId,
                                  shapeAction.delta, Offset.zero, false, false);
                            }
                            shapeAction.delta = Offset.zero;
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
                            socketRotationEmission(shapeAction.angle,
                                DrawingState.up, actionId, false);
                            shapeAction.shapesOffsets!.clear();
                            undoList.add(shapeAction.copy());
                            shapeAction.angle = 0;
                            actionsMap.update(actionId, (value) => shapeAction);
                            floatButtonPressed = false;
                            changeTool("select", "");
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
                        if (mounted) {
                          setState(() {
                            drawType = "rotate";
                            floatButtonPressed = true;
                          });
                        }
                      },
                      //todo: make color fit with toolbar: need provider
                      child: const Icon(Icons.rotate_left),
                      backgroundColor:
                          (floatButtonPressed) ? Colors.green : Colors.blue)),
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
                      if (mounted) {
                        setState(() {
                          undoActionChooser();
                        });
                      }
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
                    },
                    child: const Icon(Icons.redo)),
              ),
            ),
          ),
          Align(
            alignment: Alignment.bottomRight,
            child: Visibility(
              visible: selectedItems.containsValue(_user.uid),
              child: FloatingActionButton(
                onPressed: () {
                  if (mounted) {
                    setState(() {
                      var selectedItem = selectedItems.entries.firstWhere(
                          (selectedItem) => selectedItem.value == _user.uid);
                      var actionId = selectedItem.key;
                      socketDeleteEmission(actionId, false);
                    });
                  }
                },
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
    } else if (undoAction.delta != Offset.zero) {
      socketResizeEmission(DrawingState.move, undoAction.actionId, undoAction,
          Offset.zero, true, false);
    } else {
      socketSelectionEmission(undoAction.actionId, false);
      socketDeleteEmission(undoAction.actionId, true);
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
    } else if (redoAction.delta != Offset.zero) {
      socketResizeEmission(DrawingState.move, redoAction.actionId, redoAction,
          Offset.zero, false, true);
    } else if (redoAction.actionType == "Freedraw") {
      socketFreedrawEmission(
          redoAction, DrawingState.up, true, redoAction.actionId);
    } else if (redoAction.actionType == "Rectangle" ||
        redoAction.actionType == "Ellipse") {
      socketShapeEmission(redoAction, redoAction.actionType, DrawingState.up,
          redoAction.actionId, true);
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
    for (int i = 0; i < selectedBounds.length; i++) {
      if (selectedBounds[i].contains(details.localPosition)) {
        hasSelectedBound = true;
        selectedBoundIndex = i;
      }
    }
    return hasSelectedBound;
  }

  void changeColor(Color color, String type) {
    switch (type) {
      case "Body":
        if (mounted) {
          setState(() {
            currentBodyColor = color;
            floatButtonPressed = false;
          });
        }
        break;
      case "Border":
        if (mounted) {
          setState(() {
            currentBorderColor = color;
            floatButtonPressed = false;
          });
        }
        break;
      case "Background":
        if (mounted) {
          setState(() {
            currentBackgroundColor = color;
            floatButtonPressed = false;
          });
        }
        break;
    }
  }

  void changeWidth(double width) {
    if (mounted) {
      setState(() {
        currentWidth = width;
        floatButtonPressed = false;
      });
    }
  }

  void unselectBeforeLeave() {
    selectedItems.forEach((actionId, selectedBy) {
      if (selectedBy == _user.uid) {
        socketSelectionEmission(actionId, false);
      }
    });
  }

  void changeTool(String type, String fillType) {
    if (mounted) {
      setState(() {
        if (type == DrawingType.rectangle || type == DrawingType.ellipse) {
          currentFillType = fillType;
        }
        drawType = type;
        floatButtonPressed = false;
      });
    }
  }

  void socketSelectionReception() {
    _socket.on('selection:received', (data) {
      if (mounted) {
        setState(() {
          if (data['isSelected']) {
            selectedItems.putIfAbsent(
                data['actionId'], () => data['selectedBy'] as String);
            allowMove = true;
          } else {
            selectedItems.remove(data['actionId']);
          }
        });
      }
    });
  }

  void socketTranslationReception() {
    _socket.on('translation:received', (data) {
      undoList.removeWhere((shapeAction) =>
          shapeAction.actionId == data['selectedActionId'] &&
          data['userId'] != _user.uid);
      redoList.removeWhere((shapeAction) =>
          shapeAction.actionId == data['selectedActionId'] &&
          data['userId'] != _user.uid);
      if (mounted) {
        setState(() {
          if (data["state"] != DrawingState.up) {
            actionsMap.forEach((actionId, shapeAction) {
              if (actionId == data['selectedActionId'] ||
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
      }
    });
  }

  void socketRotationReception() {
    _socket.on('rotation:received', (data) {
      undoList.removeWhere((shapeAction) =>
          shapeAction.actionId == data['selectedActionId'] &&
          data['userId'] != _user.uid);
      redoList.removeWhere((shapeAction) =>
          shapeAction.actionId == data['selectedActionId'] &&
          data['userId'] != _user.uid);
      if (mounted) {
        setState(() {
          if (data['state'] == DrawingState.move) {
            Path actionPath = actionsMap[data['selectedActionId']].path;
            Offset center = actionPath.getBounds().center;

            //transform path with matrix of rotation
            Matrix4 matriceRotation =
                Matrix4.rotationZ(data['angle'].toDouble());
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
      }
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
      undoList.removeWhere((shapeAction) =>
          shapeAction.actionId == data['selectedActionId'] &&
          data['userId'] != _user.uid);
      redoList.removeWhere((shapeAction) =>
          shapeAction.actionId == data['selectedActionId'] &&
          data['userId'] != _user.uid);
      if (mounted) {
        setState(() {
          if (data['state'] == DrawingState.down) {
            actionsMap[data['selectedActionId']].oldShape =
                actionsMap[data['selectedActionId']].path;
          } else if (data['state'] == DrawingState.move) {
            Path actionPath = Path();
            if (data['isUndoRedo']) {
              actionPath = actionsMap[data['selectedActionId']].path;
            } else {
              actionPath = actionsMap[data['selectedActionId']].oldShape;
            }

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
            ShapeAction shapeAction = actionsMap[data['selectedActionId']];
            shapeAction.path = scaledPath;
            shapeAction.scale =
                Offset(data['xScale'].toDouble(), data['yScale'].toDouble());
            actionsMap.update(data['selectedActionId'], (value) => shapeAction);
            if (data['isUndoRedo']) {
              actionsMap[data['selectedActionId']].delta = Offset.zero;
            }
          } else if (data['state'] == DrawingState.up) {
            actionsMap[data['selectedActionId']].delta = Offset.zero;
          }
        });
      }
    });
  }

  void socketShapeReception() {
    _socket.on('shape:received', (data) {
      if (mounted) {
        setState(() {
          if (data['state'] == DrawingState.down) {
            unselectLastShape();
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
              shapeAction.fillType = "fill";
            } else {
              shapeAction.fillType = "border";
            }

            //Save the action and the offsets
            shapeAction.shapesOffsets = offsets;
            actionsMap.putIfAbsent(data['actionId'], () => shapeAction);
          } else if (data['state'] == DrawingState.move) {
            unselectLastShape();
            actionsMap.forEach((actionId, shapeAction) {
              //Find the action
              if (actionId == data['actionId']) {
                //Update list of points
                shapeAction.shapesOffsets
                    .add(Offset(data['x2'].toDouble(), data['y2'].toDouble()));

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
            if (!data['isUndoRedo']) {
              ShapeAction shapeAction = actionsMap[data['actionId']];
              unselectLastShape();
              if (_user.uid == data['userId']) {
                undoList.add(shapeAction.copy());
              }
            }
            if (data['isUndoRedo']) {
              final paintBorder = Paint()
                ..color = Color.fromARGB(data['a'] as int, data['r'] as int,
                    data['g'] as int, data['b'] as int)
                ..isAntiAlias = true
                ..strokeWidth = data['width'].toDouble()
                ..style = PaintingStyle.stroke;

              Rect rect = Rect.fromPoints(
                  Offset(data['x'].toDouble(), data['y'].toDouble()),
                  Offset(data['x2'].toDouble(), data['y2'].toDouble()));

              Path path = Path();
              if (data['shapeType'] == DrawingType.ellipse) {
                path.addOval(rect);
              } else {
                path.addRect(rect);
              }

              ShapeAction shapeAction = ShapeAction(
                  path, data['shapeType'], paintBorder, data['actionId']);

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
              shapeAction.shapesOffsets = [
                Offset(data['x'], data['y']),
                Offset(data['x2'].toDouble(), data['y2'].toDouble())
              ];
              shapeAction.fillType = data['shapeStyle'];
              actionsMap.putIfAbsent(data['actionId'], () => shapeAction);
            }
          }
        });
      }
    });
  }

  void socketFreedrawReception() {
    _socket.on('freedraw:received', (data) {
      if (mounted) {
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
          } else if (data['state'] == DrawingState.up) {
            if (!data['isUndoRedo']) {
              ShapeAction shapeAction = actionsMap[data['actionId']];
              unselectLastShape();
              if (_user.uid == data['userId'] && !data['isUndoRedo']) {
                undoList.add(shapeAction.copy());
              }
            }
            if (data['isUndoRedo']) {
              Path path = Path();
              List<Offset> realOffsets = [];
              for (var offset in (data['offsets'])) {
                realOffsets.add(Offset(offset.values.first.toDouble(),
                    offset.values.last.toDouble()));
              }
              var firstPoint = (data['offsets']).removeAt(0);
              path.moveTo(firstPoint.values.first.toDouble(),
                  firstPoint.values.last.toDouble());
              path.lineTo(firstPoint.values.first.toDouble() + 1,
                  firstPoint.values.last.toDouble());
              for (var offset in (data['offsets'])) {
                path.lineTo(offset.values.first.toDouble(),
                    offset.values.last.toDouble());
              }

              final paint = Paint()
                ..color = Color.fromARGB(data['a'] as int, data['r'] as int,
                    data['g'] as int, data['b'] as int)
                ..isAntiAlias = true
                ..strokeWidth = data['width'].toDouble()
                ..style = PaintingStyle.stroke;
              //Merge attributes and save shape
              ShapeAction shapeAction = ShapeAction(
                  path, data['actionType'], paint, data['actionId']);
              shapeAction.shapesOffsets = realOffsets;
              actionsMap.putIfAbsent(data['actionId'], () => shapeAction);
            }
          }
        });
      }
    });
  }

  void socketDeleteReception() {
    _socket.on('delete:received', (data) {
      undoList.removeWhere(
          (shapeAction) => shapeAction.actionId == data['selectedActionId']);
      redoList.removeWhere((shapeAction) =>
          shapeAction.actionId == data['selectedActionId'] &&
          data['userId'] != _user.uid);
      if (mounted) {
        setState(() {
          actionsMap.remove(data["selectedActionId"]);
          selectedItems.remove(data["selectedActionId"]);
        });
      }
    });
  }

  void socketSaveConfirmation() {
    _socket.on('action:saved', (data) {
      _socket.emit("selection:emit", {
        'actionId': data['actionId'],
        'username': _user.displayName,
        'userId': _user.uid,
        'collaborationId': _collaborationId,
        'actionType': "Select",
        'isSelected': true,
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
      'collaborationId': _collaborationId,
      'actionType': "Select",
      'isSelected': isSelected,
    });
  }

  void socketTranslationEmission(String selectItem, double xTranslation,
      double yTranslation, String drawingState, bool isUndoRedo) {
    if (!isUndoRedo) {
      actionsMap[selectItem].translate += Offset(xTranslation, yTranslation);
    }

    if (!hasOngoingMovement || isUndoRedo) {
      selectionActionId = const Uuid().v1();
      hasOngoingMovement = true;
    }

    _socket.emit("translation:emit", {
      'actionId': selectionActionId,
      'selectedActionId': selectItem,
      'username': _user.displayName,
      'userId': _user.uid,
      'state': drawingState,
      'collaborationId': _collaborationId,
      'actionType': "Translate",
      'xTranslation': xTranslation,
      'yTranslation': yTranslation,
      'isUndoRedo': isUndoRedo
    });

    if (drawingState == DrawingState.up || isUndoRedo) {
      hasOngoingMovement = false;
    }
  }

  void socketDeleteEmission(String actionId, bool isUndoRedo) {
    _socket.emit('delete:emit', {
      'actionId': const Uuid().v1(),
      'selectedActionId': actionId,
      'username': _user.displayName,
      'userId': _user.uid,
      'collaborationId': _collaborationId,
      'actionType': 'Delete',
      'isUndoRedo': isUndoRedo,
    });
  }

  void socketRotationEmission(
      var details, String drawingState, String actionId, bool isUndoRedo) {
    if (!hasOngoingMovement || isUndoRedo) {
      selectionActionId = const Uuid().v1();
      hasOngoingMovement = true;
    }

    _socket.emit('rotation:emit', {
      'actionId': selectionActionId,
      'selectedActionId': actionId,
      'actionType': "Rotate",
      'state': drawingState,
      'angle': (isUndoRedo || DrawingState.up == drawingState)
          ? details
          : calculateAngleVariation(actionId,
              Offset(details.localPosition.dx, details.localPosition.dy)),
      'username': _user.displayName,
      'userId': _user.uid,
      'collaborationId': _collaborationId,
      'isUndoRedo': isUndoRedo,
    });

    if (drawingState == DrawingState.up || isUndoRedo) {
      hasOngoingMovement = false;
    }
  }

  void socketResizeEmission(String drawingState, String actionId,
      var currentPosition, Offset previousPosition, bool isUndo, bool isRedo) {
    Bounds bounds = Bounds();
    Offset varDelta =
        (isUndo || isRedo) ? Offset.zero : currentPosition - previousPosition;
    if (drawingState == DrawingState.down) {
      actionsMap[actionId].oldShape = actionsMap[actionId].path;
      actionsMap[actionId].boundIndex = selectedBoundIndex;
    } else if (drawingState == DrawingState.move && !isUndo && !isRedo) {
      bounds.setResizeData(
          actionsMap, actionId, selectedBoundIndex!, varDelta, false);
    } else if (drawingState == DrawingState.up) {
      bounds.setResizeData(actionsMap, actionId,
          actionsMap[actionId].boundIndex, currentPosition, true);
    } else if (isUndo || isRedo) {
      bounds.xScale =
          (isUndo) ? 1 / currentPosition.scale.dx : currentPosition.scale.dx;
      bounds.yScale =
          (isUndo) ? 1 / currentPosition.scale.dy : currentPosition.scale.dy;

      bounds.xTranslation = currentPosition.scaledTranslation.dx;
      bounds.yTranslation = currentPosition.scaledTranslation.dy;
    }

    if (!hasOngoingMovement || isUndo || isRedo) {
      selectionActionId = const Uuid().v1();
      hasOngoingMovement = true;
    }

    _socket.emit('resize:emit', {
      'actionId': selectionActionId,
      'actionType': "Resize",
      'selectedActionId': actionId,
      'username': _user.displayName,
      'userId': _user.uid,
      'collaborationId': _collaborationId,
      'xScale': bounds.xScale,
      'yScale': bounds.yScale,
      'xTranslation': bounds.xTranslation,
      'yTranslation': bounds.yTranslation,
      'state': drawingState,
      'isUndoRedo': (isUndo || isRedo) ? true : false,
    });

    if (drawingState == DrawingState.up || isUndo || isRedo) {
      hasOngoingMovement = false;
    }
  }

  void socketShapeEmission(var details, String drawingType, String drawingState,
      String actionId, bool isRedo) {
    if (actionId != "") {
      shapeID = actionId;
    }
    if (drawingState == DrawingState.down) {
      firstPoint = Offset(details.localPosition.dx, details.localPosition.dy);
    }

    _socket.emit("shape:emit", {
      'actionId': (drawingState == DrawingState.down && !isRedo)
          ? shapeID = const Uuid().v1()
          : shapeID,
      'username': _user.displayName,
      'userId': _user.uid,
      'collaborationId': _collaborationId,
      'actionType': 'Shape',
      'state': drawingState,
      'isSelected': (drawingState == DrawingState.up) ? false : true,
      'x': (isRedo) ? details.shapesOffsets.first.dx : firstPoint.dx,
      'y': (isRedo) ? details.shapesOffsets.first.dy : firstPoint.dy,
      'a':
          (isRedo) ? details.borderColor.color.alpha : currentBorderColor.alpha,
      'r': (isRedo) ? details.borderColor.color.red : currentBorderColor.red,
      'g':
          (isRedo) ? details.borderColor.color.green : currentBorderColor.green,
      'b': (isRedo) ? details.borderColor.color.blue : currentBorderColor.blue,
      'x2': (isRedo)
          ? details.shapesOffsets.last.dx
          : (drawingState == DrawingState.up)
              ? actionsMap[shapeID].shapesOffsets.last.dx
              : details.localPosition.dx.toInt(),
      'y2': (isRedo)
          ? details.shapesOffsets.last.dy
          : (drawingState == DrawingState.up)
              ? actionsMap[shapeID].shapesOffsets.last.dy
              : details.localPosition.dy.toInt(),
      'rFill': (isRedo && details.fillType == "fill")
          ? details.bodyColor.color.red
          : currentBodyColor.red,
      'gFill': (isRedo && details.fillType == "fill")
          ? details.bodyColor.color.green
          : currentBodyColor.green,
      'bFill': (isRedo && details.fillType == "fill")
          ? details.bodyColor.color.blue
          : currentBodyColor.blue,
      'aFill': (isRedo && details.fillType == "fill")
          ? details.bodyColor.color.alpha
          : (currentFillType == "fill")
              ? currentBodyColor.alpha
              : 0,
      'width': (isRedo) ? details.borderColor.strokeWidth : currentWidth,
      'shapeType': (isRedo) ? details.actionType : drawType,
      'shapeStyle': (isRedo) ? details.fillType : currentFillType,
      'isUndoRedo': isRedo,
    });
  }

  void socketFreedrawEmission(
      var details, String drawingState, bool isRedo, String actionId) {
    List<Map<String, double>> testList = [];
    if (actionId != "") {
      shapeID = actionId;
    }
    if (drawingState == DrawingState.up && !isRedo) {
      for (var offset in (actionsMap[shapeID] as ShapeAction).shapesOffsets!) {
        testList.add({"x": offset.dx.toDouble(), "y": offset.dy.toDouble()});
      }
    } else if (drawingState == DrawingState.up && isRedo) {
      for (var offset in (details as ShapeAction).shapesOffsets!) {
        testList.add({"x": offset.dx.toDouble(), "y": offset.dy.toDouble()});
      }
    }

    _socket.emit("freedraw:emit", {
      'x': (drawingState == DrawingState.up)
          ? 0
          : details.localPosition.dx.toInt(),
      'y': (drawingState == DrawingState.up)
          ? 0
          : details.localPosition.dy.toInt(),
      'collaborationId': _collaborationId,
      'username': _user.displayName,
      'userId': _user.uid,
      'actionType': "Freedraw",
      'state': drawingState,
      'a': (isRedo)
          ? (details as ShapeAction).borderColor.color.alpha
          : currentBorderColor.alpha,
      'r': (isRedo)
          ? (details as ShapeAction).borderColor.color.red
          : currentBorderColor.red,
      'g': (isRedo)
          ? (details as ShapeAction).borderColor.color.green
          : currentBorderColor.green,
      'b': (isRedo)
          ? (details as ShapeAction).borderColor.color.blue
          : currentBorderColor.blue,
      'width': (isRedo)
          ? (details as ShapeAction).borderColor.strokeWidth
          : currentWidth,
      'offsets': testList,
      'isSelected': (drawingState == DrawingState.up || isRedo) ? false : true,
      'isUndoRedo': isRedo,
      'actionId': (drawingState == DrawingState.down && !isRedo)
          ? shapeID = const Uuid().v1()
          : shapeID,
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
      this.setCornersCallback, this.currentWidth);

  String drawType;
  Map actionsMap;
  Map selectedItems;
  User user;
  Function setCornersCallback;
  double currentWidth;

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
          if (shapeAction.fillType != "border") {
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
      bounds.topLeft - Offset(currentWidth / 2, currentWidth / 2),
      Offset(bounds.topLeft.dx + (bounds.topRight.dx - bounds.topLeft.dx) / 2,
              bounds.topLeft.dy) -
          Offset(0, currentWidth / 2),
      bounds.topRight + Offset(currentWidth / 2, -currentWidth / 2),
      Offset(
              bounds.topRight.dx,
              bounds.bottomRight.dy +
                  (bounds.topRight.dy - bounds.bottomRight.dy) / 2) +
          Offset(currentWidth / 2, 0),
      bounds.bottomRight + Offset(currentWidth / 2, currentWidth / 2),
      Offset(
              bounds.bottomLeft.dx +
                  (bounds.topRight.dx - bounds.topLeft.dx) / 2,
              bounds.bottomRight.dy) +
          Offset(0, currentWidth / 2),
      bounds.bottomLeft + Offset(-currentWidth / 2, currentWidth / 2),
      Offset(
              bounds.bottomLeft.dx,
              bounds.bottomLeft.dy +
                  (bounds.topLeft.dy - bounds.bottomLeft.dy) / 2) +
          Offset(-currentWidth / 2, 0),
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
