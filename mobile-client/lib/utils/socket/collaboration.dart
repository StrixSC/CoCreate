import 'dart:convert';
import 'dart:ui';

import 'package:Colorimage/models/chat.dart';
import 'package:Colorimage/models/collaboration.dart';
import 'package:Colorimage/models/drawing.dart';
import 'package:Colorimage/screens/chat/chat.dart';
import 'package:Colorimage/utils/socket/socket_service.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:vector_math/vector_math_64.dart';
// import 'package:vector_math/vector_math.dart';

class HexColor extends Color {
  static int _getColorFromHex(String hexColor) {
    hexColor = hexColor.toUpperCase().replaceAll("#", "");
    if (hexColor.length == 6) {
      hexColor = "FF" + hexColor;
    }
    return int.parse(hexColor, radix: 16);
  }

  HexColor(final String hexColor) : super(_getColorFromHex(hexColor));
}

class CollaborationSocket extends SocketService {
  CollaborationSocket(User user, IO.Socket socket) : super(user, socket);

  // Emits
  joinCollaboration(String collaborationId, String type, String? password) {
    print("Join Collab: $collaborationId");
    if (type == "Protected") {
      socket.emit('collaboration:join', {
        'userId': user.uid,
        'collaborationId': collaborationId,
        'type': type,
        'password': password,
      });
    } else {
      socket.emit('collaboration:join', {
        'userId': user.uid,
        'collaborationId': collaborationId,
        'type': type,
      });
    }
  }

  connectCollaboration(String collaborationId) {
    print('Connect to Collab');
    socket.emit('collaboration:connect',
        {'userId': user.uid, 'collaborationId': collaborationId});
  }

  createCollaboration(
    String creatorId,
    String title,
    String type,
    String? password,
  ) {
    print('Create Collab');
    socket.emit('collaboration:create', {
      'userId': user.uid,
      'creatorId': creatorId,
      'isTeam': user.uid != creatorId,
      'title': title,
      'type': type,
      'password': password
    });
  }

  updateCollaboration(
      String collaborationId, String title, String type, String? password) {
    print('Update Collab');
    if (type == "Protected") {
      socket.emit('collaboration:update', {
        'userId': user.uid,
        'collaborationId': collaborationId,
        'title': title,
        'type': type,
        'password': password
      });
    } else {
      socket.emit('collaboration:update', {
        'userId': user.uid,
        'collaborationId': collaborationId,
        'title': title,
        'type': type,
      });
    }
  }

  deleteCollaboration(String collaborationId) {
    print('Delete Collab');
    socket.emit('collaboration:delete', {
      'userId': user.uid,
      'collaborationId': collaborationId,
    });
  }

  leaveCollaboration(String collaborationId) {
    print('Leave Collab');
    socket.emit('collaboration:leave', {
      'userId': user.uid,
      'collaborationId': collaborationId,
    });
  }

  disconnectCollaboration(String collaborationId) {
    print('Disconnect Collab');
    socket.emit('collaboration:disconnect', {
      'userId': user.uid,
      'collaborationId': collaborationId,
    });
  }

  // Path path;
  // Paint? bodyColor;
  // Paint borderColor;
  // String actionType;
  // int? layer;
  // List<Offset>? shapesOffsets;
  // int? boundIndex;
  // Path? oldShape;
  // Offset delta = Offset.zero;
  // TextPainter? text;
  // String actionId;
  // double angle = 0;
  // Offset translate = Offset.zero;

  // Receives
  load(callbackMessage) {
    socket.on('collaboration:load', (data) {
      print('Collaboration Load');

      List<Member> members = [];
      for (var element in (data["members"] as List<dynamic>)) {
        members.add(Member(
            username: element["username"], avatarUrl: element["avatarUrl"]));
      }
      // TODO: Create new Action Map from actions list received to match our Action class
      Collaboration collaboration = Collaboration(
        collaborationId: 'id',
        actions: data["actions"],
        backgroundColor: HexColor(data["backgroundColor"]),
        memberCount: data["memberCount"],
        width: data["width"],
        height: data["height"],
        members: members,
        actionsMap: rebuildActionsMap(data["actions"]),
      );
      callbackMessage('load', collaboration);
    });
  }

  Map<String, ShapeAction> rebuildActionsMap(var actions) {
    Map<String, ShapeAction> actionsMap = {};
    actions.forEach((action) {
      if (action['actionType'] == "Freedraw") {
        freedrawLoad(action, actionsMap);
      } else if (action['actionType'] == "Shape") {
        shapeLoad(action, actionsMap);
      } else if (action['actionType'] == "Rotate") {
        rotateLoad(actionsMap, action);
      } else if (action['actionType'] == "Translate") {
        translateLoad(actionsMap, action);
      } else if (action['actionType'] == "Resize") {
        resizeLoad(actionsMap, action);
      }
    });

    return actionsMap;
  }

  void resizeLoad(Map<String, ShapeAction> actionsMap, action) {
    ShapeAction? shapeAction = actionsMap[action['actionId']];

    Matrix4 matrixTranslation;
    matrixTranslation = Matrix4.translationValues(
        -action['xTranslation'].toDouble(),
        -action['yTranslation'].toDouble(),
        0);
    Path scaledPath =
        shapeAction!.path.transform(matrixTranslation.storage);

    Matrix4 matrixScale = Matrix4.identity();
    matrixScale.scale(
        action['xScale'].toDouble(), action['yScale'].toDouble());
    scaledPath = scaledPath.transform(matrixScale.storage);

    // // Translate to match fix corner position
    Matrix4 matrixTranslation2;
    matrixTranslation2 = Matrix4.translationValues(
        action['xTranslation'].toDouble(),
        action['yTranslation'].toDouble(),
        0);
    scaledPath = scaledPath.transform(matrixTranslation2.storage);

    // Save the scaled path
    shapeAction.path = scaledPath;
    actionsMap.update(action['actionId'], (value) => shapeAction);
  }

  void translateLoad(Map<String, ShapeAction> actionsMap, action) {
    ShapeAction? shapeAction = actionsMap[action['actionId']];
    Matrix4 matrix4 = Matrix4.translationValues(
        action['xTranslation'].toDouble(),
        action['yTranslation'].toDouble(),
        0);
    shapeAction!.path = shapeAction.path.transform(matrix4.storage);

    actionsMap.update(action['actionId'], (value) => shapeAction);
  }

  void rotateLoad(Map<String, ShapeAction> actionsMap, action) {
    Path actionPath = actionsMap[action['selectedActionId']]!.path;
    Offset center = actionPath.getBounds().center;

    Matrix4 matriceRotation = Matrix4.rotationZ(action['angle'].toDouble());
    actionPath = actionPath.transform(matriceRotation.storage);

    Offset newCenter = actionPath.getBounds().center;
    Matrix4 matriceTranslation = Matrix4.translationValues(
        (center - newCenter).dx, (center - newCenter).dy, 0);
    actionPath = actionPath.transform(matriceTranslation.storage);

    actionsMap[action['selectedActionId']]!.path = actionPath;
  }

  void shapeLoad(action, Map<String, ShapeAction> actionsMap) {
    final paintBorder = Paint()
      ..color = Color.fromARGB(action['a'] as int, action['r'] as int,
          action['g'] as int, action['b'] as int)
      ..isAntiAlias = true
      ..strokeWidth = action['width'].toDouble()
      ..style = PaintingStyle.stroke;

    Rect rect = Rect.fromPoints(
        Offset(action['x'], action['y']), Offset(action['x2'], action['y2']));

    Path path = Path();
    if (action['shapeType'] == DrawingType.ellipse) {
      path.addOval(rect);
    } else {
      path.addRect(rect);
    }

    ShapeAction shapeAction =
        ShapeAction(path, action['shapeType'], paintBorder, action['actionId']);

    if (action['shapeStyle'] == "fill") {
      final paintFill = Paint()
        ..color = Color.fromARGB(action['aFill'] as int, action['rFill'] as int,
            action['gFill'] as int, action['bFill'] as int)
        ..isAntiAlias = true
        ..strokeWidth = action['width'].toDouble()
        ..style = PaintingStyle.fill;
      shapeAction.bodyColor = paintFill;
    }

    actionsMap.putIfAbsent(action['actionId'], () => shapeAction);
  }

  void freedrawLoad(action, Map<String, ShapeAction> actionsMap) {
    Path path = Path();
    List<Offset> realOffsets = [];
    var data = json.decode(action['offsets']);
    for (var offset in data) {
      realOffsets.add(Offset(
          offset.values.first.toDouble(), offset.values.last.toDouble()));
    }

    var firstPoint = data.removeAt(0);
    path.moveTo(
        firstPoint.values.first.toDouble(), firstPoint.values.last.toDouble());
    path.lineTo(firstPoint.values.first.toDouble() + 1,
        firstPoint.values.last.toDouble());
    for (var offset in data) {
      path.lineTo(
          offset.values.first.toDouble(), offset.values.last.toDouble());
    }

    final paint = Paint()
      ..color = Color.fromARGB(action['a'] as int, action['r'] as int,
          action['g'] as int, action['b'] as int)
      ..isAntiAlias = true
      ..strokeWidth = action['width'].toDouble()
      ..style = PaintingStyle.stroke;

    ShapeAction shapeAction =
        ShapeAction(path, action['actionType'], paint, action['actionId']);
    shapeAction.shapesOffsets = realOffsets;

    actionsMap.putIfAbsent(action['actionId'], () => shapeAction);
  }

  joined(callbackChannel) {
    socket.on('collaboration:joined', (data) {
      print('Collaboration Joined');
      Member member = Member(
        drawingId: data['drawingId'],
        userId: data['userId'],
        username: data['username'],
        avatarUrl: data['avatarUrl'],
        type: "",
        isActive: false,
      );
      callbackChannel('joined', member);
    });
  }

  connected(callbackChannel) {
    socket.on('collaboration:connected', (data) {
      print('Collaboration Connected');
      Member member = Member(
        userId: data['userId'],
        username: data['username'],
        avatarUrl: data['avatarUrl'],
        type: "",
        isActive: true,
      );
      callbackChannel('connected', member);
    });
  }

  created(callbackChannel) {
    socket.on('collaboration:created', (data) {
      print(data);
      print('Collaboration Created');
      Collaboration collaboration = Collaboration(
          collaborationId: data["collaborationId"],
          actions: [],
          memberCount: data['currentCollaboratorCount'],
          members: [
            Member(
              drawingId: data['drawingId'],
              userId: '',
              username: data["authorUsername"],
              avatarUrl: data["authorAvatarUrl"].toString(),
              type: data['type'],
              isActive: false,
            )
          ],
          actionsMap: {}); //data["maxMemberCount"],);
      Drawing drawing = Drawing(
          drawingId: data['drawingId'],
          thumbnailUrl: data['thumbnailUrl'],
          title: data['title'],
          authorUsername: data["authorUsername"],
          authorAvatar: data["authorAvatarUrl"].toString(),
          createdAt: data['createdAt'],
          collaboration: collaboration,
          type: data['type']); // "Protected", "Public" or "Private"
      callbackChannel('created', drawing);
    });
  }

  updated(callbackChannel) {
    socket.on('collaboration:updated', (data) {
      print('Collaboration Updated');
      Collaboration collaboration = Collaboration(
          collaborationId: 'id',
          actions: data["actions"],
          backgroundColor: data["backgroundColor"],
          memberCount: data["memberCount"],
          width: data["width"],
          height: data["height"],
          members: data["members"],
          actionsMap: {});
      Drawing drawing = Drawing(
          drawingId: data['drawingId'],
          thumbnailUrl: data['thumbnailUrl'],
          title: data['title'],
          authorUsername: data["authorUsername"],
          authorAvatar: data["authorAvatarUrl"],
          createdAt: data['createdAt'],
          collaboration: collaboration,
          type: 'type'); // "Protected", "Public" or "Private"
      callbackChannel('updated', drawing);
    });
  }

  deleted(callbackChannel) {
    socket.on('collaboration:deleted', (data) {
      print('Collaboration deleted');
      Map deleted = {
        "collaborationId": data["collaborationId"],
        "deletedAt": data["deletedAt"],
      };
      callbackChannel('deleted', deleted);
    });
  }

  left(callbackChannel) {
    socket.on('collaboration:left', (data) {
      print('Collaboration left');
      Map left = {
        "collaborationId": data["collaborationId"],
        "userId": data["userId"],
        "username": data["username"],
        "avatarUrl": data["avatarUrl"],
        "leftAt": data["leftAt"], // ISO Format date
      };
      callbackChannel('left', left);
    });
  }

  // TODO : collaborationId is null -> nawras
  disconnected(callbackChannel) {
    socket.on('collaboration:disconnected', (data) {
      print('Collaboration disconnected');
      // Map disconnected = {
      //   "collaborationId": data["collaborationId"],
      //   "userId": data["userId"],
      //   "username": data["username"],
      //   "avatarUrl": data["avatarUrl"],
      // };
      // callbackChannel('disconnect', disconnected);
    });
  }

  initializeChannelSocketEvents(callbackChannel) {
    load(callbackChannel);

    joined(callbackChannel);

    connected(callbackChannel);

    created(callbackChannel);

    updated(callbackChannel);

    deleted(callbackChannel);

    left(callbackChannel);

    disconnected(callbackChannel);

    print("initialized Collaboration socket events");
  }
}
