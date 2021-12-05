import 'dart:ui';

import 'package:Colorimage/models/chat.dart';
import 'package:Colorimage/models/collaboration.dart';
import 'package:Colorimage/models/drawing.dart';
import 'package:Colorimage/screens/chat/chat.dart';
import 'package:Colorimage/utils/socket/socket_service.dart';
import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

import '../../app.dart';

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

class CollaborationSocket {
  User user;
  IO.Socket socket;

  CollaborationSocket({required this.user, required this.socket});

  // Emits
  joinCollaboration(String collaborationId, String type, String? password) {
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
      Color color,
  ) {
    print('Create Collab');
    String hexColor = '#${color.value.toRadixString(16)}';
    socket.emit('collaboration:create', {
      'userId': user.uid,
      'creatorId': creatorId,
      'isTeam': user.uid != creatorId,
      'title': title,
      'type': type,
      'password': password,
      'bgColor' : hexColor
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

      print(data["actions"]); // Actions List

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
          actionsMap: {}); // TODO: add correct Actions Map here
      callbackMessage('load', collaboration);
    });
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
          ], actionsMap: {}); //data["maxMemberCount"],);
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
      // Collaboration collaboration = Collaboration(
      //     collaborationId: 'id',
      //     actions: [],
      //     backgroundColor: Colors.white,
      //     actionsMap: {}, members: []);
      // Drawing drawing = Drawing(
      //     drawingId: data['drawingId'],
      //     thumbnailUrl: data['thumbnailUrl'],
      //     title: data['title'],
      //     authorUsername: data["authorUsername"],
      //     authorAvatar: data["authorAvatarUrl"],
      //     createdAt: data['createdAt'],
      //     collaboration: collaboration,
      //     type: 'type'); // "Protected", "Public" or "Private"
      callbackChannel('updated', '');
    });
  }

  deleted(callbackChannel) {
    socket.on('collaboration:deleted', (data) {
      print('Collaboration deleted');
      Map deleted = {
        "collaborationId": data["collaborationId"],
        "deletedAt": data["deletedAt"] ?? '',
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
      print(data);
      // Map disconnected = {
      //   "drawingId": data["drawingId"],
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
  }
}
