import 'package:Colorimage/models/team.dart';
import 'package:Colorimage/utils/socket/socket_service.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class TeamSocket {
  User user;
  IO.Socket socket;

  TeamSocket({required this.user, required this.socket});

  data(Team team) {
    return {
      'id': team.id,
      'teamName': team.name,
      'bio': team.bio,
      'maxMemberCount': team.maxMemberCount,
      'type': team.type,
      'mascot': team.mascot,
      'password': team.password
    };
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

  updateTeams(Team team) {
    print('Emit Update Collab');
    socket.emit('teams:update', data(team));
  }

  deleteTeams(Team team) {
    print('Emit Delete Team');
    socket.emit('teams:delete', data(team));
  }

  leaveTeams(Team team) {
    print('Emit Leave Collab');
    socket.emit('teams:leave', data(team));
  }

  // TODO: In provider add to this team the missing param and then replace
  joined(callbackChannel) {
    socket.on('teams:joined', (data) {
      print('Teams joined');
      Team updatedTeam = Team(
        id: data['teamId'],
        authorUsername: data['authorUsername'],
        authorAvatarUrl: data['authorAvatarUrl'],
        name: data['teamName'],
        bio: data['teamBio'],
        maxMemberCount: data['maxMemberCount'],
        type: data['type'],
        mascot: data['mascot'],
        members: [],
      );
      callbackChannel('updated', updatedTeam);
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
    socket.on('teams:joined:finished', (data) {
      print('Teams joined finished');
    });
  }

  left(callbackChannel) {
    socket.on('teams:left', (data) {
      print('Teams left');
      Team updatedTeam = Team(
        id: data['teamId'],
        authorUsername: data['authorUsername'],
        authorAvatarUrl: data['authorAvatarUrl'],
        name: data['teamName'],
        bio: data['teamBio'],
        maxMemberCount: data['maxMemberCount'],
        type: data['type'],
        mascot: data['mascot'],
        members: [],
      );
      callbackChannel('updated', updatedTeam);
    });
  }

  onLeaveException() {
    // TODO
    socket.on('teams:left:exception', (data) {
      print('Teams left exception' + data.toString());
    });
  }

  onLeaveFinished() {
    // TODO
    socket.on('teams:left:finished', (data) {
      print('Teams left finished');
    });
  }

  // TODO: In provider add to this team the missing param and then replace
  created(callbackChannel) {
    socket.on('teams:created', (data) {
      print('Teams created');
      Team updatedTeam = Team(
        id: data['teamId'],
        authorUsername: data['authorUsername'],
        authorAvatarUrl: data['authorAvatarUrl'],
        name: data['teamName'],
        bio: data['teamBio'],
        maxMemberCount: data['maxMemberCount'],
        type: data['type'],
        mascot: data['mascot'],
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
    // TODO
    socket.on('teams:created:finished', (data) {
      print('Teams created finished');
    });
  }

  // TODO: In provider add to this team the missing param and then replace
  deleted(callbackChannel) {
    socket.on('teams:deleted', (data) {
      print('Teams deleted');
      Team updatedTeam = Team(
        id: data['teamId'],
        authorUsername: data['authorUsername'],
        authorAvatarUrl: data['authorAvatarUrl'],
        name: data['teamName'],
        bio: data['teamBio'],
        maxMemberCount: data['maxMemberCount'],
        type: data['type'],
        mascot: data['mascot'],
        members: [],
      );
      callbackChannel('deleted', updatedTeam);
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
    socket.on('teams:deleted:finished', (data) {
      print('Teams deleted finished');
    });
  }

  // TODO: In provider add to this team the missing param and then replace
  updated(callbackChannel) {
    socket.on('teams:updated', (data) {
      print('Teams updated');
      Team updatedTeam = Team(
        id: data['teamId'],
        authorUsername: data['authorUsername'],
        authorAvatarUrl: data['authorAvatarUrl'],
        name: data['teamName'],
        bio: data['teamBio'],
        maxMemberCount: data['maxMemberCount'],
        type: data['type'],
        mascot: data['mascot'],
        members: [],
      );
      callbackChannel('updated', updatedTeam);
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
    socket.on('teams:updated:finished', (data) {
      print('Teams updated finished');
    });
  }

  initializeChannelSocketEvents(callbackChannel) {
    joined(callbackChannel);

    left(callbackChannel);

    created(callbackChannel);

    deleted(callbackChannel);

    updated(callbackChannel);

    print("initialized Teams socket events");
  }
}
