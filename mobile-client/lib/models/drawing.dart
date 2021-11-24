import 'dart:ui';

import 'package:flutter/cupertino.dart';

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
        Matrix4 matrixScale = Matrix4.identity();
        matrixScale.scale(xScale, yScale);
        Path scaledPath = actionPath.transform(matrixScale.storage);
        if (xScale! < 0 && yScale! < 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().right -
              scaledPath.getBounds().left;
          yTranslation = actionsMap[actionId].oldShape.getBounds().bottom -
              scaledPath.getBounds().top;
        } else if (xScale! < 0 && yScale! > 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().right -
              scaledPath.getBounds().left;
          yTranslation = actionsMap[actionId].oldShape.getBounds().bottom -
              scaledPath.getBounds().bottom;
        }
        if (xScale! > 0 && yScale! < 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().right -
              scaledPath.getBounds().right;
          yTranslation = actionsMap[actionId].oldShape.getBounds().bottom -
              scaledPath.getBounds().top;
        } else if (xScale! > 0 && yScale! > 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().right -
              scaledPath.getBounds().right;
          yTranslation = actionsMap[actionId].oldShape.getBounds().bottom -
              scaledPath.getBounds().bottom;
        }
        break;
      case 1:
        double yDelta = actionsMap[actionId].oldShape.getBounds().height -
            actionsMap[actionId].delta.dy;
        yScale = yDelta / actionsMap[actionId].oldShape.getBounds().height;
        xScale = 1;

        Path actionPath = actionsMap[actionId].oldShape;
        Matrix4 matrixScale = Matrix4.identity();
        matrixScale.scale(xScale, yScale);
        Path scaledPath = actionPath.transform(matrixScale.storage);
        if (yScale! < 0) {
          yTranslation = actionsMap[actionId].oldShape.getBounds().bottom -
              scaledPath.getBounds().top;
          xTranslation = 0;
        } else {
          xTranslation = 0;
          yTranslation = actionsMap[actionId].oldShape.getBounds().bottom -
              scaledPath.getBounds().bottom;
        }
        break;
      case 2:
        double xDelta = actionsMap[actionId].oldShape.getBounds().width +
            actionsMap[actionId].delta.dx;
        xScale = xDelta / actionsMap[actionId].oldShape.getBounds().width;

        double yDelta = actionsMap[actionId].oldShape.getBounds().height -
            actionsMap[actionId].delta.dy;
        yScale = yDelta / actionsMap[actionId].oldShape.getBounds().height;

        Path actionPath = actionsMap[actionId].oldShape;
        Matrix4 matrixScale = Matrix4.identity();
        matrixScale.scale(xScale, yScale);
        Path scaledPath = actionPath.transform(matrixScale.storage);
        if (xScale! < 0 && yScale! < 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().left -
              scaledPath.getBounds().right;
          yTranslation = actionsMap[actionId].oldShape.getBounds().bottom -
              scaledPath.getBounds().top;
        } else if (xScale! < 0 && yScale! > 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().left -
              scaledPath.getBounds().right;
          yTranslation = actionsMap[actionId].oldShape.getBounds().bottom -
              scaledPath.getBounds().bottom;
        }
        if (xScale! > 0 && yScale! < 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().left -
              scaledPath.getBounds().left;
          yTranslation = actionsMap[actionId].oldShape.getBounds().bottom -
              scaledPath.getBounds().top;
        } else if (xScale! > 0 && yScale! > 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().left -
              scaledPath.getBounds().left;
          yTranslation = actionsMap[actionId].oldShape.getBounds().bottom -
              scaledPath.getBounds().bottom;
        }
        break;
      case 3:
        double xDelta = actionsMap[actionId].oldShape.getBounds().width +
            actionsMap[actionId].delta.dx;
        xScale = xDelta / actionsMap[actionId].oldShape.getBounds().width;
        yScale = 1;

        Path actionPath = actionsMap[actionId].oldShape;
        Matrix4 matrixScale = Matrix4.identity();
        matrixScale.scale(xScale, yScale);
        Path scaledPath = actionPath.transform(matrixScale.storage);

        if (xScale! < 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().left -
              scaledPath.getBounds().right;
          yTranslation = 0;
        } else {
          xTranslation = actionsMap[actionId].oldShape.getBounds().left -
              scaledPath.getBounds().left;
          yTranslation = 0;
        }
        break;
      case 4:
        double xDelta = actionsMap[actionId].oldShape.getBounds().width +
            actionsMap[actionId].delta.dx;
        xScale = xDelta / actionsMap[actionId].oldShape.getBounds().width;

        double yDelta = actionsMap[actionId].oldShape.getBounds().height +
            actionsMap[actionId].delta.dy;
        yScale = yDelta / actionsMap[actionId].oldShape.getBounds().height;

        Path actionPath = actionsMap[actionId].oldShape;
        Matrix4 matrixScale = Matrix4.identity();
        matrixScale.scale(xScale, yScale);
        Path scaledPath = actionPath.transform(matrixScale.storage);
        if (xScale! < 0 && yScale! < 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().right -
              scaledPath.getBounds().left;
          yTranslation = actionsMap[actionId].oldShape.getBounds().top -
              scaledPath.getBounds().bottom;
        } else if (xScale! < 0 && yScale! > 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().left -
              scaledPath.getBounds().right;
          yTranslation = actionsMap[actionId].oldShape.getBounds().top -
              scaledPath.getBounds().top;
        }
        if (xScale! > 0 && yScale! < 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().right -
              scaledPath.getBounds().right;
          yTranslation = actionsMap[actionId].oldShape.getBounds().top -
              scaledPath.getBounds().bottom;
        } else if (xScale! > 0 && yScale! > 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().left -
              scaledPath.getBounds().left;
          yTranslation = actionsMap[actionId].oldShape.getBounds().top -
              scaledPath.getBounds().top;
        }
        break;
      case 5:
        double yDelta = actionsMap[actionId].oldShape.getBounds().height +
            actionsMap[actionId].delta.dy;
        yScale = yDelta / actionsMap[actionId].oldShape.getBounds().height;
        xScale = 1;

        Path actionPath = actionsMap[actionId].oldShape;
        Matrix4 matrixScale = Matrix4.identity();
        matrixScale.scale(xScale, yScale);
        Path scaledPath = actionPath.transform(matrixScale.storage);
        if (yScale! < 0) {
          yTranslation = actionsMap[actionId].oldShape.getBounds().top -
              scaledPath.getBounds().bottom;
          xTranslation = 0;
        } else {
          xTranslation = 0;
          yTranslation = actionsMap[actionId].oldShape.getBounds().top -
              scaledPath.getBounds().top;
        }
        break;
      case 6:
        double xDelta = actionsMap[actionId].oldShape.getBounds().width -
            actionsMap[actionId].delta.dx;
        xScale = xDelta / actionsMap[actionId].oldShape.getBounds().width;

        double yDelta = actionsMap[actionId].oldShape.getBounds().height +
            actionsMap[actionId].delta.dy;
        yScale = yDelta / actionsMap[actionId].oldShape.getBounds().height;

        Path actionPath = actionsMap[actionId].oldShape;
        Matrix4 matrixScale = Matrix4.identity();
        matrixScale.scale(xScale, yScale);
        Path scaledPath = actionPath.transform(matrixScale.storage);
        if (xScale! < 0 && yScale! < 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().right -
              scaledPath.getBounds().left;
          yTranslation = actionsMap[actionId].oldShape.getBounds().top -
              scaledPath.getBounds().bottom;
        } else if (xScale! < 0 && yScale! > 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().right -
              scaledPath.getBounds().left;
          yTranslation = actionsMap[actionId].oldShape.getBounds().top -
              scaledPath.getBounds().top;
        }
        if (xScale! > 0 && yScale! < 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().right -
              scaledPath.getBounds().right;
          yTranslation = actionsMap[actionId].oldShape.getBounds().top -
              scaledPath.getBounds().bottom;
        } else if (xScale! > 0 && yScale! > 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().right -
              scaledPath.getBounds().right;
          yTranslation = actionsMap[actionId].oldShape.getBounds().top -
              scaledPath.getBounds().top;
        }
        break;
      case 7:
        double xDelta = actionsMap[actionId].oldShape.getBounds().width -
            actionsMap[actionId].delta.dx;
        xScale = xDelta / actionsMap[actionId].oldShape.getBounds().width;
        yScale = 1;

        Path actionPath = actionsMap[actionId].oldShape;
        Matrix4 matrixScale = Matrix4.identity();
        matrixScale.scale(xScale, yScale);
        Path scaledPath = actionPath.transform(matrixScale.storage);
        if (xScale! < 0) {
          xTranslation = actionsMap[actionId].oldShape.getBounds().right -
              scaledPath.getBounds().left;
          yTranslation = 0;
        } else {
          xTranslation = actionsMap[actionId].oldShape.getBounds().right -
              scaledPath.getBounds().right;
          yTranslation = 0;
        }
        break;
    }
  }
}

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
  double? angle;

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
    return copy;
  }
}
