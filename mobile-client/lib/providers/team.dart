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
import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:intl/intl.dart';

import '../app.dart';
import '../models/chat.dart';

class Teammate extends ChangeNotifier {
  UserCredential? auth;
  List<Team> teams = [];
  late TeamSocket teamSocket;
  late PagingController pagingController;
  bool isPartOfTeam = false;
  List<String> myTeams = [];
  Map myTeamsMap = <String, String>{};

  bool hasBeenInitialized = false;

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

  Future<void> fetchMyTeams() async {
    myTeams = ['Moi (${auth!.user!.displayName})'];
    myTeamsMap = <String, String>{};

    RestApi rest = RestApi();
    String? type = 'Aucun';
    String? filter = '';

    if (type == 'Aucun') {
      type = null;
    }

    if (filter.isEmpty) {
      filter = null;
    }
    var response = await rest.team.fetchTeams(
        filter, 0, 50, type, false, true, false);

    if (response.statusCode == 200) {
      var jsonResponse = json.decode(response.body); //Map<String, dynamic>;
      var resp = jsonResponse['teams'];
      for (var data in resp) {
        if (data != null) {
          myTeamsMap.putIfAbsent(data['teamName']  as String, () => data['teamId'] as String);
          myTeams.add(data['teamName']);
        }
      }
    } else {
      // print(response.body);
      // throw ("Theres was a problem in the fetching of teams...");
      AwesomeDialog(
        context: navigatorKey.currentContext as BuildContext,
        width: 800,
        btnOkColor: Colors.red,
        dismissOnTouchOutside: false,
        dialogType: DialogType.ERROR,
        animType: AnimType.BOTTOMSLIDE,
        title: 'Erreur!',
        desc: 'Les équipes ont pas pu être retrouvées...',
        btnOkOnPress: () {},
      ).show();
    }
    notifyListeners();
  }

  void isPartOfATeam() async {
    isPartOfTeam = false;
    RestApi rest = RestApi();
    var response = await rest.team.fetchTeams(
        null, 0, 100, null, false, true, false);
    // print(json.decode(response.body));
    if (response.statusCode == 200) {
      var jsonResponse = json.decode(response.body); //Map<String, dynamic>;
      List resp = jsonResponse['teams'];
      resp.isEmpty ? isPartOfTeam = false : isPartOfTeam = true;
    }
    notifyListeners();
  }

  bool isMember(Team team) {
    for(var member in team.members) {
      if(member.username == auth!.user!.displayName) {
        return true;
      }
    }
    return false;
  }

  void updateTeam(Team team) {
    var index = teams.indexWhere((element) => element.id == team.id);
    teams[index] = team;
    notifyListeners();
  }

  void updateUser(UserCredential updatedUser) {
    auth = updatedUser;
    notifyListeners();
  }

  void updateTeams(List updatedTeams) {
    if(hasBeenInitialized) { pagingController.refresh();}
    notifyListeners();
  }

  void addTeams(List<Team> team) {
    teams.addAll(team);
    notifyListeners();
  }

  void joinedTeam(Team team) {
    if(hasBeenInitialized) { pagingController.refresh();}
    notifyListeners();
  }

  void createdTeam(Team team) {
    if(hasBeenInitialized) { pagingController.refresh();}
    notifyListeners();
  }

  void updatedTeam(Team team) {
    if(hasBeenInitialized) { pagingController.refresh();}
    notifyListeners();
  }

  void deletedTeam(Team team) {
    if(hasBeenInitialized) { pagingController.refresh();}
    notifyListeners();
  }

  void leftTeam(Team team) {
    if(hasBeenInitialized) { pagingController.refresh();}
    notifyListeners();
  }

  void callbackChannel(eventType, data) {
    // Team team = data as Team;
    switch (eventType) {
      case 'joined':
        // joinedTeam(team);
        alert('Succès!', 'La chaine a été joint!');
        break;
      case 'created':
        // createdTeam(team);
        alert('Succès!', 'La chaine a été quitter!');
        break;
      default:
        print("Invalid Team socket event");
    }

    if(hasBeenInitialized) { pagingController.refresh();}
    notifyListeners();
  }

  void alert(type, description) {
    AwesomeDialog(
      context:
      navigatorKey.currentContext as BuildContext,
      width: 800,
      dismissOnTouchOutside: false,
      dialogType: DialogType.SUCCES,
      animType: AnimType.BOTTOMSLIDE,
      title: 'Succès!',
      desc: description,
      btnOkOnPress: () {},
    ).show();
  }
}
