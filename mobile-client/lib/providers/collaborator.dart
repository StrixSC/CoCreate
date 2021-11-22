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
  List<Drawing> userDrawings = [];
  List<Drawing> allDrawings = [];
  List<Drawing> availableDrawings = [];
  bool isDrawing = false;
  late int currentDrawingIndex = 0;
  late CollaborationSocket collaborationSocket;

  Collaborator(this.auth, this.allDrawings);

  void setSocket(socket) {
    collaborationSocket = socket;
    if (socket.socket.connected) {
      print("Collab socket events initialized");
      collaborationSocket.initializeChannelSocketEvents(callbackChannel);
    }
    notifyListeners();
  }

  void updateUser(UserCredential updatedUser) {
    auth = updatedUser;
    notifyListeners();
  }

  void updateDrawings(List<Drawing> updatedDrawings) {
    allDrawings = updatedDrawings;
    notifyListeners();
  }

  void addDrawings(List<Drawing> updatedDrawings) {
    for (var element in updatedDrawings) {allDrawings.add(element); }
    notifyListeners();
  }

  void loadDrawing(Collaboration collaboration) {
    collaboration.collaborationId =
        allDrawings[currentDrawingIndex].collaboration.collaborationId;
    allDrawings[currentDrawingIndex].collaboration = collaboration;
    notifyListeners();
  }

  void memberJoined(Member member) {
    allDrawings[currentDrawingIndex].collaboration.members.add(member);
    allDrawings[currentDrawingIndex].collaboration.memberCount++;
    notifyListeners();
  }

  void memberConnected(Member member) {
    int index = allDrawings[currentDrawingIndex]
        .collaboration
        .members
        .indexWhere((element) => element.userId == member.userId);
    if (index != -1) {
      allDrawings[currentDrawingIndex].collaboration.members[index].isActive =
          true;
      notifyListeners();
    } else {
      throw ("Connected member user index not found.");
    }
  }

  void drawingCreated(Drawing drawing) {
    allDrawings.add(drawing);
    notifyListeners();
  }

  void updatedDrawing(Drawing drawing) {
    allDrawings.add(drawing);
    notifyListeners();
  }

  void deletedDrawing(Map delete) {
    String collaborationId = delete["collaborationId"];
    String deletedAt = delete["deletedAt"];
    int index = allDrawings.indexWhere(
        (element) => element.collaboration.collaborationId == collaborationId);
    if (index != -1) {
      allDrawings.removeAt(index);
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
    int index = allDrawings.indexWhere(
        (element) => element.collaboration.collaborationId == collaborationId);
    if (index != -1) {
      allDrawings[index]
          .collaboration
          .members
          .removeWhere((member) => member.userId == userId);
      allDrawings[index].collaboration.memberCount--;
      notifyListeners();
    } else {
      throw ("Left member collaboration index not found.");
    }
    notifyListeners();
  }

  Future<void> fetchDrawings(String? filter, int offset, int limit) async {
    RestApi rest = RestApi();
    var response = await rest.drawing.fetchDrawings(filter, offset, limit);
    if (response.statusCode == 200) {
      var jsonResponse =
          json.decode(response.body) as List<dynamic>; //Map<String, dynamic>;
      print('fetchDrawings');
      print(jsonResponse);
      List<Drawing> drawings = [];
      for (var drawing in jsonResponse) {
        Collaboration collaboration = Collaboration(
            collaborationId: drawing["collaboration_id"],
            memberCount: drawing["collaborator_count"],
            maxMemberCount: drawing["max_collaborator_count"]);
        // TODO: add updated_at && thumbnail url
        allDrawings.add(Drawing(
            drawingId: drawing['drawing_id'],
            authorUsername: drawing["author_username"],
            authorAvatar: drawing["author_avatar"],
            title: drawing['title'],
            createdAt: drawing['created_at'],
            collaboration: collaboration,
            type: drawing['type']));
      }
      updateDrawings(drawings);
    } else {
      print('Request failed with status: ${response.statusCode}.');
      if(response.statusCode != 204) { updateDrawings([]); };
    }
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
