import 'dart:ui';

import 'package:flutter/cupertino.dart';

class DrawingType {
  static const String rectangle = "Rectangle";
  static const String ellipse = "Ellipse";
  static const String freedraw = "freedraw";
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
  static const rightCenter = 3;
  static const bottomRight = 4;
  static const bottomCenter = 5;
  static const bottomLeft = 6;
  static const leftCenter = 7;

  Offset getDeltaFactor(borderIndex, xDelta, yDelta) {
    switch (borderIndex) {
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
    return Offset(xDelta, yDelta);
  }

  Offset getCornerFromTransformedPath(selectedBoundIndex, scaledPath) {
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
    return corner;
  }
}

class Action {
  Path path;
  Paint bodyColor;
  Paint borderColor;
  String actionType;
  int? layer;
  TextPainter? text;

  Action(this.path, this.actionType, this.bodyColor, this.borderColor);

  setPath(Path newPath) {
    path = newPath;
  }

  setBodyColor(Paint newBodyColor) {
    bodyColor = newBodyColor;
  }

  setBorderColor(Paint newBorderColor) {
    borderColor = newBorderColor;
  }
}
