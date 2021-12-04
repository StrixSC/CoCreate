import 'dart:convert';

import 'package:Colorimage/models/collaboration.dart';
import 'package:Colorimage/models/drawing.dart';
import 'package:Colorimage/models/team.dart';
import 'package:Colorimage/models/user.dart';
import 'package:Colorimage/screens/chat/chat.dart';
import 'package:Colorimage/screens/galerie/galerie.dart';
import 'package:Colorimage/utils/rest/channels_api.dart';
import 'package:Colorimage/utils/rest/rest_api.dart';
import 'package:Colorimage/utils/rest/users_api.dart';
import 'package:Colorimage/utils/socket/channel.dart';
import 'package:Colorimage/utils/socket/collaboration.dart';
import 'package:Colorimage/utils/socket/team.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';

import '../models/chat.dart';

class Teammate extends ChangeNotifier {
  UserCredential? auth;
  List<Team> teams = [];
  late TeamSocket teamSocket;
  late PagingController pagingController;
  bool isPartOfTeam = false;

  Teammate(this.auth);

  void setSocket(socket) {
    teamSocket = socket;
    teamSocket.socket.on('connect', (_) {
      print("Team socket events initialized");
      teamSocket.initializeChannelSocketEvents(callbackChannel);
    });
    notifyListeners();
  }

  String convertToFrench(englishType) {
    String frenchType = 'Aucun';
    switch (englishType) {
      case 'Public':
        frenchType = 'Public';
        break;
      case 'Protected':
        frenchType = 'Protégé';
        break;
    }
    return frenchType;
  }

  String convertToEnglish(frenchType) {
    String englishType = 'Aucun';
    switch (frenchType) {
      case 'Public':
        englishType = 'Public';
        break;
      case 'Protégé':
        englishType = 'Protected';
        break;
    }
    return englishType;
  }

  void isPartOfATeam() async {
    isPartOfTeam = false;
    RestApi rest = RestApi();
    var response = await rest.team.fetchTeams(
        null, 0, 100, null, false, true, false);
    print(json.decode(response.body));
    if (response.statusCode == 200) {
      var jsonResponse = json.decode(response.body); //Map<String, dynamic>;
      List resp = jsonResponse['teams'];
      resp.isEmpty ? isPartOfTeam = false : isPartOfTeam = true;
    }
    notifyListeners();
  }

  void updateUser(UserCredential updatedUser) {
    auth = updatedUser;
    notifyListeners();
  }

  void updateTeam(List updatedTeams) {
    notifyListeners();
  }

  void addTeams(List<Team> team) {
    teams.addAll(team);
    notifyListeners();
  }

  void memberJoined(Team team) {
    notifyListeners();
  }

  void teamCreated(Team team) {
    pagingController.refresh();
    notifyListeners();
  }

  void updatedDrawing(Team team) {
    notifyListeners();
  }

  void deletedDrawing(Team team) {
    notifyListeners();
  }

  void leftDrawing(Team team) {
    notifyListeners();
  }

  void callbackChannel(eventType, data) {
    Team team = data as Team;
    switch (eventType) {
      case 'joined':
        memberJoined(team);
        break;
      case 'created':
        teamCreated(team);
        break;
      case 'updated':
        updatedDrawing(team);
        break;
      case 'deleted':
        deletedDrawing(team);
        break;
      case 'left':
        leftDrawing(team);
        break;
      default:
        print("Invalid Team socket event");
    }
  }
}
