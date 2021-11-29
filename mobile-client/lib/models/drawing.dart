import 'package:Colorimage/models/collaboration.dart';
import 'dart:ui';
import 'package:flutter/cupertino.dart';

class Drawing {
  String drawingId, thumbnailUrl, title, type, authorUsername, authorAvatar;
  String createdAt; // change to date?
  String? updatedAt;
  Collaboration collaboration;

  Drawing({
    required this.drawingId,
    this.thumbnailUrl = "",
    required this.title,
    required this.authorUsername,
    required this.authorAvatar,
    required this.createdAt,
    required this.collaboration,
    required this.type,
  });
}

class DrawingType {
  static const String rectangle = "Rectangle";
  static const String ellipse = "Ellipse";
  static const String freedraw = "Freedraw";
}

class DrawingState {
  static const String move = "move";
  static const String down = "down";
  static const String up = "up";
}

class Bounds {
  static const topLeft = 0;
  static const topCenter = 1;
  static const topRight = 2;
  static const centerRight = 3;
  static const bottomRight = 4;
  static const bottomCenter = 5;
  static const bottomLeft = 6;
  static const centerLeft = 7;

  double? xScale;
  double? yScale;
  double? xTranslation;
  double? yTranslation;

  void setResizeData(
      Map actionsMap, String actionId, int boundIndex, Offset varDelta) {
    actionsMap[actionId].delta += Offset(varDelta.dx, varDelta.dy);

    switch (boundIndex) {
      case 0:
        double xDelta = actionsMap[actionId].oldShape.getBounds().width -
            actionsMap[actionId].delta.dx;
        xScale = xDelta / actionsMap[actionId].oldShape.getBounds().width;

        double yDelta = actionsMap[actionId].oldShape.getBounds().height -
            actionsMap[actionId].delta.dy;
        yScale = yDelta / actionsMap[actionId].oldShape.getBounds().height;

        Path actionPath = actionsMap[actionId].oldShape;
        xTranslation =
            actionPath.getBounds().topLeft.dx + actionPath.getBounds().width;
        yTranslation =
            actionPath.getBounds().topLeft.dy + actionPath.getBounds().height;
        break;
      case 1:
        double yDelta = actionsMap[actionId].oldShape.getBounds().height -
            actionsMap[actionId].delta.dy;
        yScale = yDelta / actionsMap[actionId].oldShape.getBounds().height;
        xScale = 1;

        Path actionPath = actionsMap[actionId].oldShape;
        xTranslation = actionPath.getBounds().topLeft.dx;
        yTranslation =
            actionPath.getBounds().topLeft.dy + actionPath.getBounds().height;
        break;
      case 2:
        double xDelta = actionsMap[actionId].oldShape.getBounds().width +
            actionsMap[actionId].delta.dx;
        xScale = xDelta / actionsMap[actionId].oldShape.getBounds().width;

        double yDelta = actionsMap[actionId].oldShape.getBounds().height -
            actionsMap[actionId].delta.dy;
        yScale = yDelta / actionsMap[actionId].oldShape.getBounds().height;

        Path actionPath = actionsMap[actionId].oldShape;
        xTranslation = actionPath.getBounds().topLeft.dx;
        yTranslation =
            actionPath.getBounds().topLeft.dy + actionPath.getBounds().height;
        break;
      case 3:
        double xDelta = actionsMap[actionId].oldShape.getBounds().width +
            actionsMap[actionId].delta.dx;
        xScale = xDelta / actionsMap[actionId].oldShape.getBounds().width;
        yScale = 1;

        Path actionPath = actionsMap[actionId].oldShape;
        xTranslation = actionPath.getBounds().topLeft.dx;
        yTranslation = actionPath.getBounds().topLeft.dy;
        break;
      case 4:
        double xDelta = actionsMap[actionId].oldShape.getBounds().width +
            actionsMap[actionId].delta.dx;
        xScale = xDelta / actionsMap[actionId].oldShape.getBounds().width;

        double yDelta = actionsMap[actionId].oldShape.getBounds().height +
            actionsMap[actionId].delta.dy;
        yScale = yDelta / actionsMap[actionId].oldShape.getBounds().height;

        Path actionPath = actionsMap[actionId].oldShape;
        xTranslation = actionPath.getBounds().topLeft.dx;
        yTranslation = actionPath.getBounds().topLeft.dy;
        break;
      case 5:
        double yDelta = actionsMap[actionId].oldShape.getBounds().height +
            actionsMap[actionId].delta.dy;
        yScale = yDelta / actionsMap[actionId].oldShape.getBounds().height;
        xScale = 1;

        Path actionPath = actionsMap[actionId].oldShape;
        xTranslation = actionPath.getBounds().topLeft.dx;
        yTranslation = actionPath.getBounds().topLeft.dy;
        break;
      case 6:
        double xDelta = actionsMap[actionId].oldShape.getBounds().width -
            actionsMap[actionId].delta.dx;
        xScale = xDelta / actionsMap[actionId].oldShape.getBounds().width;

        double yDelta = actionsMap[actionId].oldShape.getBounds().height +
            actionsMap[actionId].delta.dy;
        yScale = yDelta / actionsMap[actionId].oldShape.getBounds().height;

        Path actionPath = actionsMap[actionId].oldShape;
        xTranslation =
            actionPath.getBounds().topLeft.dx + actionPath.getBounds().width;
        yTranslation = actionPath.getBounds().topLeft.dy;
        break;
      case 7:
        double xDelta = actionsMap[actionId].oldShape.getBounds().width -
            actionsMap[actionId].delta.dx;
        xScale = xDelta / actionsMap[actionId].oldShape.getBounds().width;
        yScale = 1;

        Path actionPath = actionsMap[actionId].oldShape;
        xTranslation =
            actionPath.getBounds().topLeft.dx + actionPath.getBounds().width;
        yTranslation = actionPath.getBounds().topLeft.dy;
        break;
    }
  }
}

//todo: regroup undoRedo elements
class ShapeAction {
  Path path;
  Paint? bodyColor;
  Paint borderColor;
  String actionType;
  int? layer;
  List<Offset>? shapesOffsets;
  int? boundIndex;
  Path? oldShape;
  Offset delta = Offset.zero;
  TextPainter? text;
  String actionId;
  double angle = 0;
  Offset translate = Offset.zero;

  ShapeAction(this.path, this.actionType, this.borderColor, this.actionId);

  setPath(Path newPath) {
    path = newPath;
  }

  setBodyColor(Paint newBodyColor) {
    bodyColor = newBodyColor;
  }

  setBorderColor(Paint newBorderColor) {
    borderColor = newBorderColor;
  }

  ShapeAction copy() {
    ShapeAction copy = ShapeAction(path, actionType, borderColor, actionId);
    copy.angle = angle;
    copy.translate = translate;
    copy.bodyColor = bodyColor;
    return copy;
  }
}
