import 'dart:convert';

import 'package:Colorimage/models/collaboration.dart';
import 'package:Colorimage/models/drawing.dart';
import 'package:Colorimage/models/user.dart';
import 'package:Colorimage/screens/chat/chat.dart';
import 'package:Colorimage/utils/rest/channels_api.dart';
import 'package:Colorimage/utils/rest/rest_api.dart';
import 'package:Colorimage/utils/rest/users_api.dart';
import 'package:Colorimage/utils/socket/channel.dart';
import 'package:Colorimage/utils/socket/collaboration.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';

import '../models/chat.dart';

class Collaborator extends ChangeNotifier {
  UserCredential? auth;
  Map drawings =
      <String, Map<String, Drawing>>{}; // <section, <drawing_id, drawing>>
  Map allDrawings = <String, Drawing>{}; // drawings not joined yet
  Map userDrawings = <String, Drawing>{}; // drawings already joined
  bool isDrawing = false;
  String currentType = "Available"; // sections : Available, Joined
  late String currentDrawingId = '';
  late CollaborationSocket collaborationSocket;

  Collaborator(this.auth) {
    drawings.putIfAbsent("Available", () => <String, Drawing>{});
    drawings.putIfAbsent("Joined", () => <String, Drawing>{});
  }

  void setSocket(socket) {
    collaborationSocket = socket;
    collaborationSocket.socket.on('connect', (_) {
      print("Collab socket events initialized");
      collaborationSocket.initializeChannelSocketEvents(callbackChannel);
    });
    notifyListeners();
  }

  String convertToFrench(englishType) {
    String frenchType = 'Aucun';
    switch(englishType) {
      case 'Public':
        frenchType = 'Public';
        break;
      case 'Protected':
        frenchType = 'Protégé';
        break;
      case 'Private':
        frenchType = 'Privée';
        break;
    }
    return frenchType;
  }

  String convertToEnglish(frenchType) {
    String englishType = 'Aucun';
    print('1');
    switch(frenchType) {
      case 'Public':
        englishType = 'Public';
        break;
      case 'Protégé':
        englishType = 'Protected';
        break;
      case 'Privée':
        englishType = 'Private';
        break;
    }
    return englishType;
  }

  void setCurrentType(type) {
    currentType = type;
    notifyListeners();
  }

  bool isEmpty() {
    return drawings[currentType].isEmpty;
  }

  void updateUser(UserCredential updatedUser) {
    auth = updatedUser;
    notifyListeners();
  }

  void updateDrawings(Map<String, Drawing> updatedDrawings) {
    drawings.update(currentType, (value) => updatedDrawings);
    notifyListeners();
  }

  void addDrawings(List<Drawing> updatedDrawings) {
    for (var drawing in updatedDrawings) {
      (drawings[currentType] as Map<String, Drawing>)
          .putIfAbsent(drawing.drawingId, () => drawing);
    }

    notifyListeners();
  }

  void loadDrawing(Collaboration collaboration) {
    // Since collab id is not sent (just for local object manipulation)
    collaboration.collaborationId =
        drawings[currentType][currentDrawingId].collaboration.collaborationId;
    drawings[currentType][currentDrawingId].collaboration = collaboration;
    notifyListeners();
  }

  void memberJoined(Member member) {
    if(drawings[currentType].containsKey(member.drawingId)) {
      drawings[currentType][currentDrawingId].collaboration.members.add(member);
      drawings[currentType][currentDrawingId].collaboration.memberCount++;
      notifyListeners();
    }
  }

  void memberConnected(Member member) {
    int index = drawings[currentType][currentDrawingId]
        .collaboration
        .members
        .indexWhere((element) => element.userId == member.userId);
    if (index != -1) {
      drawings[currentType][currentDrawingId]
          .collaboration
          .members[index]
          .isActive = true;
      notifyListeners();
    } else {
      throw ("Connected member user index not found.");
    }
  }

  void drawingCreated(Drawing drawing) {
    (drawings[currentType] as Map<String, Drawing>)
        .putIfAbsent(drawing.drawingId, () => drawing);
    notifyListeners();
  }

  void updatedDrawing(Drawing drawing) {
    drawings[currentType][currentDrawingId] = drawing;
    notifyListeners();
  }

  void deletedDrawing(Map delete) {
    String collaborationId = delete["collaborationId"];
    String deletedAt = delete["deletedAt"];
    dynamic object =
        (drawings[currentType] as Map<String, Drawing>).remove(collaborationId);
    if (object != null) {
      notifyListeners();
    } else {
      throw ("Delete drawing collaboration index not found.");
    }
    notifyListeners();
  }

  // TODO: left vs disconnect && joined vs connected
  void leftDrawing(Map left) {
    String collaborationId = left["collaborationId"];
    String userId = left["userId"];
    String username = left["username"];
    String avatarUrl = left["avatarUrl"];
    String leftAt = left["leftAt"];
    int index = drawings[currentType][currentDrawingId]
        .collaboration
        .members
        .indexWhere((element) => element.userId == userId);
    if (index != -1) {
      drawings[currentType][currentDrawingId]
          .collaboration
          .members
          .removeWhere((member) => member.userId == userId);
      drawings[currentType][currentDrawingId].collaboration.memberCount--;
      notifyListeners();
    } else {
      throw ("Left member collaboration index not found.");
    }
    notifyListeners();
  }

  void callbackChannel(eventType, data) {
    switch (eventType) {
      case 'load':
        Collaboration collaboration = data as Collaboration;
        loadDrawing(collaboration);
        break;
      case 'joined':
        Member member = data as Member;
        memberJoined(member);
        break;
      case 'connected':
        Member member = data as Member;
        memberConnected(member);
        break;
      case 'created':
        Drawing drawing = data as Drawing;
        drawingCreated(drawing);
        break;
      case 'updated':
        Drawing drawing = data as Drawing;
        updatedDrawing(drawing);
        break;
      case 'deleted':
        Map delete = data as Map;
        deletedDrawing(delete);
        break;
      case 'left':
        Map left = data as Map;
        leftDrawing(left);
        break;
      default:
        print("Invalid Collaboration socket event");
    }
  }
}
