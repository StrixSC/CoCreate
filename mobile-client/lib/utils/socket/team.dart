import 'package:Colorimage/models/team.dart';
import 'package:Colorimage/utils/socket/socket_service.dart';
import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

import '../../app.dart';

class TeamSocket {
  User user;
  IO.Socket socket;

  TeamSocket({required this.user, required this.socket});

  data(Team team) {
     Map data = {
      'teamId': team.id,
      'teamName': team.name,
      'bio': team.bio,
      'maxMemberCount': team.maxMemberCount,
      'type': team.type,
      'mascot': team.mascot,
    };
     team.password != null ? data['password'] = team.password : '';
    return data;
  }

  // Emits
  joinTeam(Team team) {
    print("Emit Join Team: ${team.name}");
    socket.emit('teams:join', data(team));
  }

  createTeam(Team team) {
    print('Emit Create Team');
    socket.emit('teams:create', data(team));
  }

  updateTeam(Team team) {
    print('Emit Update Team');
    socket.emit('teams:update', data(team));
  }

  deleteTeam(Team team) {
    print('Emit Delete Team');
    socket.emit('teams:delete', data(team));
  }

  leaveTeam(Team team) {
    print('Emit Leave Team');
    socket.emit('teams:leave', data(team));
  }

  // TODO: In provider add to this team the missing param and then replace
  joined(callbackChannel) {
    socket.on('teams:joined', (data) {
      print('Teams joined');
      // Team updatedTeam = Team(
      //   id: data['teamId'],
      //   authorUsername: data['authorUsername'],
      //   authorAvatarUrl: data['authorAvatarUrl'],
      //   name: data['teamName'],
      //   bio: data['teamBio'],
      //   maxMemberCount: data['maxMemberCount'],
      //   type: data['type'],
      //   mascot: data['mascot'],
      //   members: [],
      // );
      callbackChannel('updated', 'joinedTeam');
    });
  }

  onJoinException() {
    // TODO
    socket.on('teams:joined:exception', (data) {
      print('Teams joined exception' + data.toString());
    });
  }

  onJoinFinished() {
    // TODO
    socket.on('teams:join:finished', (data) {
      print('Teams joined finished');
      alert('Succès!', "L'équipe a été joint!");

    });
  }

  left(callbackChannel) {
    socket.on('teams:left', (data) {
      print('Teams left');
      // Team updatedTeam = Team(
      //   id: data['teamId'],
      //   authorUsername: data['authorUsername'],
      //   authorAvatarUrl: data['authorAvatarUrl'],
      //   name: data['teamName'],
      //   bio: data['teamBio'],
      //   maxMemberCount: data['maxMemberCount'],
      //   type: data['type'],
      //   mascot: data['mascot'],
      //   members: [],
      // );
      callbackChannel('updated', 'leftTeam');
    });
  }

  onLeaveException() {
    // TODO
    socket.on('teams:leave:exception', (data) {
      print('Teams left exception' + data.toString());
    });
  }

  onLeaveFinished() {
    // TODO
    socket.on('teams:leave:finished', (data) {
      print('Teams left finished');
      alert('Succès!', "L'équipe a été quitté!");
    });
  }

  // TODO: In provider add to this team the missing param and then replace
  created(callbackChannel) {
    socket.on('teams:created', (data) {
      print('Teams created');
      Team updatedTeam = Team(
        // id: data['teamId'],
        // name: data['teamName'],
        // bio: data['teamBio'],
        // maxMemberCount: data['maxMemberCount'],
        // type: data['type'],
        // mascot: data['mascot'],
        members: [],
      );
      callbackChannel('created', updatedTeam);
    });
  }

  onCreateException() {
    // TODO
    socket.on('teams:created:exception', (data) {
      print('Teams created exception' + data.toString());
    });
  }

  onCreateFinished() {
    socket.on('teams:create:finished', (data) {
      // AwesomeDialog(
      //   context:
      //   navigatorKey.currentContext as BuildContext,
      //   width: 800,
      //   dismissOnTouchOutside: false,
      //   dialogType: DialogType.SUCCES,
      //   animType: AnimType.BOTTOMSLIDE,
      //   title: 'Succes!',
      //   desc:
      //   'Bravo! Votre équipe à été créer avec succès. Amusez-vous! 😄',
      //   btnOkOnPress: () {},
      // ).show();
      alert('Succès!', "L'équipe a été créé!");
      print('Teams created finished');
    });
  }

  // TODO: In provider add to this team the missing param and then replace
  deleted(callbackChannel) {
    socket.on('teams:deleted', (data) {
      print('Teams deleted');
      // Team updatedTeam = Team(
      //   id: data['teamId'],
      //   authorUsername: data['authorUsername'],
      //   authorAvatarUrl: data['authorAvatarUrl'],
      //   name: data['teamName'],
      //   bio: data['teamBio'],
      //   maxMemberCount: data['maxMemberCount'],
      //   type: data['type'],
      //   mascot: data['mascot'],
      //   members: [],
      // );
      callbackChannel('deleted', '');
    });
  }

  onDeleteException() {
    // TODO
    socket.on('teams:deleted:exception', (data) {
      print('Teams deleted exception' + data.toString());
    });
  }

  onDeleteFinished() {
    // TODO
    socket.on('teams:delete:finished', (data) {
      print('Teams deleted finished');
      alert('Succès!', "L'équipe a été supprimer!");
    });
  }

  // TODO: In provider add to this team the missing param and then replace
  updated(callbackChannel) {
    socket.on('teams:updated', (data) {
      print('Teams updated');
      // Team updatedTeam = Team(
      //   id: data['teamId'],
      //   authorUsername: data['authorUsername'],
      //   authorAvatarUrl: data['authorAvatarUrl'],
      //   name: data['teamName'],
      //   bio: data['teamBio'],
      //   maxMemberCount: data['maxMemberCount'],
      //   type: data['type'],
      //   mascot: data['mascot'],
      //   members: [],
      // );
      callbackChannel('updated', 'updatedTeam');
    });
  }

  onUpdateException() {
    // TODO
    socket.on('teams:updated:exception', (data) {
      print('Teams updated exception' + data.toString());
    });
  }

  onUpdateFinished() {
    // TODO
    socket.on('teams:update:finished', (data) {
      print('Teams updated finished');
      alert('Succès!', "L'équipe a été mise à jour!");
    });
  }

  initializeChannelSocketEvents(callbackChannel) {
    joined(callbackChannel);
    onJoinFinished();

    left(callbackChannel);
    onLeaveFinished();

    created(callbackChannel);
    onCreateFinished();

    deleted(callbackChannel);
    onDeleteFinished();

    updated(callbackChannel);
    onUpdateFinished();
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
