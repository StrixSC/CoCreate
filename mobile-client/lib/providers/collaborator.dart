import 'dart:convert';

import 'package:Colorimage/models/collaboration.dart';
import 'package:Colorimage/models/drawing.dart';
import 'package:Colorimage/models/user.dart';
import 'package:Colorimage/screens/chat/chat.dart';
import 'package:Colorimage/screens/galerie/galerie.dart';
import 'package:Colorimage/utils/rest/channels_api.dart';
import 'package:Colorimage/utils/rest/rest_api.dart';
import 'package:Colorimage/utils/rest/users_api.dart';
import 'package:Colorimage/utils/socket/channel.dart';
import 'package:Colorimage/utils/socket/collaboration.dart';
import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import '../app.dart';
import '../models/chat.dart';

class Collaborator extends ChangeNotifier {
  UserCredential? auth;
  Map drawings =
      <String, Map<String, Drawing>>{}; // <section, <drawing_id, drawing>>
  bool isDrawing = false;
  String currentType = "Available"; // sections : Available, Joined
  late String currentDrawingId = '';
  late CollaborationSocket collaborationSocket;
  late Map pagingControllers;

  late Function navigate;
  bool hasBeenInitialized = false;

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
    switch (englishType) {
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
    switch (frenchType) {
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

  String getCollaborationId() {
    return (drawings[currentType][currentDrawingId] as Drawing)
        .collaboration
        .collaborationId;
  }

  Map getCurrentActionMap() {
    return (drawings[currentType][currentDrawingId] as Drawing)
        .collaboration
        .actionsMap;
  }

  String getDrawingId(String collaborationId) {
    String drawingId = '';
    for (var type in TYPES) {
      (drawings[type] as Map<String, Drawing>).forEach((key, value) {
        if ((drawings[type][key] as Drawing).collaboration.collaborationId ==
            collaborationId) {
          drawingId = key;
        }
      });
    }
    return drawingId;
  }

  void setCurrentType(type) {
    currentType = type;
    notifyListeners();
  }

  bool isEmpty() {
    return drawings[currentType].isEmpty;
  }

  void refreshPages() {
    if(hasBeenInitialized) {
      for (var type in TYPES) {
        pagingControllers[type].refresh();
      }
    }
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
    navigate();
    notifyListeners();
  }

  void memberJoined(Member member) {
    // if (member.userId == auth!.user!.uid) {
    //   drawings[currentType][currentDrawingId].collaboration.members.add(member);
    //   drawings[currentType][currentDrawingId].collaboration.memberCount++;
    // } else {
    //   (drawings['Available'] as Map<String, Drawing>).update(member.drawingId!,
    //       (value) {
    //     value.collaboration.members.add(member);
    //     return value;
    //   });
    //   (drawings['Available'] as Map<String, Drawing>).update(member.drawingId!,
    //       (value) {
    //     value.collaboration.memberCount++;
    //     return value;
    //   });
    // }
    refreshPages();
    notifyListeners();
  }

  // TODO: If it is sent to everyone even when not in drawing, need to change this
  void memberConnected(Member member) {

    // int index = drawings[currentType][currentDrawingId]
    //     .collaboration
    //     .members
    //     .indexWhere((element) => element.userId == member.userId);
    // if (index != -1) {
    //   drawings[currentType][currentDrawingId]
    //       .collaboration
    //       .members[index]
    //       .isActive = true;
    //   notifyListeners();
    // }
    // (drawings[currentType][currentDrawingId] as Drawing).collaboration.members.add(member);
    refreshPages();
    notifyListeners();
  }

  void drawingCreated(Drawing drawing) {
    if (drawing.authorUsername == auth!.user!.displayName) {
      (drawings['Joined'] as Map<String, Drawing>)
          .putIfAbsent(drawing.drawingId, () => drawing);
    } else {
      (drawings['Available'] as Map<String, Drawing>)
          .putIfAbsent(drawing.drawingId, () => drawing);
    }
    refreshPages();
    notifyListeners();
  }

  void updatedDrawing(Drawing drawing) {
    drawings[currentType][currentDrawingId] = drawing;
    notifyListeners();
  }

  void deletedDrawing(Map delete) {
    // String collaborationId = delete["collaborationId"];
    // String deletedAt = delete["deletedAt"];
    // var toRemove = getDrawingId(collaborationId);
    // for (var type in TYPES) {
    //   (drawings[type] as Map<String, Drawing>)
    //       .removeWhere((key, value) => toRemove == key);
    // }
    String collaborationId = delete['collaborationId'];
    if(currentType == 'Joined') {
      (drawings[currentType] as Map<String, Drawing>).forEach((key, value) {
        if ((drawings[currentType][key] as Drawing).collaboration.collaborationId ==
            collaborationId) {
          if((drawings[currentType][key] as Drawing).authorUsername == auth!.user!.displayName) {
            alert('Succès!', 'Vous avez supprimer le dessin! 😄');
          }
        }
      });
    }
    refreshPages();
    notifyListeners();
  }

  // TODO: left vs disconnect && joined vs connected
  void leftDrawing(Map left) {
    String collaborationId = left["collaborationId"];
    String userId = left["userId"];
    String username = left["username"];
    String avatarUrl = left["avatarUrl"];
    String leftAt = left["leftAt"];

    // var drawingId = getDrawingId(collaborationId);
    // for (var type in TYPES) {
    //   if (type == 'Available') {
    //     (drawings[type] as Map<String, Drawing>).update(drawingId, (value) {
    //       value.collaboration.members
    //           .removeWhere((item) => item.userId == userId);
    //       value.collaboration.memberCount--;
    //       return value;
    //     });
    //   } else {
    //     if (userId == auth!.user!.uid) {
    //       (drawings[type] as Map<String, Drawing>)
    //           .removeWhere((key, value) => drawingId == key);
    //     } else {
    //       (drawings[type] as Map<String, Drawing>).update(drawingId, (value) {
    //         value.collaboration.members
    //             .removeWhere((item) => item.userId == userId);
    //         value.collaboration.memberCount--;
    //         return value;
    //       });
    //     }
    //   }
    // }
    userId == auth!.user!.uid? currentDrawingId = '' : '';
    refreshPages();
    notifyListeners();
  }

  void disconnectedDrawing(Map left) {
    String collaborationId = left["collaborationId"];
    String userId = left["userId"];
    String username = left["username"];
    String avatarUrl = left["avatarUrl"];
    String leftAt = left["leftAt"];
    //
    // var drawingId = getDrawingId(collaborationId);
    // for (var type in TYPES) {
    //   if (type == 'Available') {
    //     (drawings[type] as Map<String, Drawing>).update(drawingId, (value) {
    //       var index = value.collaboration.members
    //           .indexWhere((item) => item.userId == userId);
    //       value.collaboration.members[index].isActive = false;
    //       return value;
    //     });
    //   }
    // }
    // (drawings[currentType][currentDrawingId] as Drawing).collaboration.members.add(member);
    userId == auth!.user!.uid? currentDrawingId = '' : '';
    refreshPages();
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
      case 'connected': // can only be someone else, when you join or connect you receive load
        Member member = data as Member;
        memberConnected(member);
        break;
      case 'created':
        Drawing drawing = data as Drawing;
        drawing.authorUsername == auth!.user!.displayName ? alert('Succès!', 'Bravo! Votre dessin à été créer avec succès. Amusez-vous! 😄') : '';
        drawingCreated(drawing);
        break;
      case 'updated':
        var authorUsername = data['authorUsername'];
        authorUsername == auth!.user!.displayName ?alert('Succès!', 'Bravo! Votre dessin à été mis a jour avec succès. Amusez-vous! 😄') : '';
        refreshPages();
        // Drawing drawing = data as Drawing;
        // updatedDrawing(drawing);
        break;
      case 'deleted':
        Map delete = data as Map;
        deletedDrawing(delete);
        break;
      case 'left':
        Map left = data as Map;
        leftDrawing(left);
        left["userId"] == auth!.user!.uid ? alert('Succès!', 'Vous avez été quitter le dessin! 😄') : '';
        break;
      case 'disconnected':
        Map disc = data as Map;
        disconnectedDrawing(disc);
        disc["userId"] == auth!.user!.uid ? alert('Succès!', 'Vous avez été déconnecté du dessin! 😄') : '';
        break;
      default:
        print("Invalid Collaboration socket event");
    }
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
