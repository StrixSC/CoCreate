import 'package:Colorimage/models/chat.dart';
import 'package:Colorimage/models/collaboration.dart';
import 'package:Colorimage/models/drawing.dart';
import 'package:Colorimage/screens/chat/chat.dart';
import 'package:Colorimage/utils/socket/socket_service.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:vector_math/vector_math.dart';

class CollaborationSocket extends SocketService {
  CollaborationSocket(User user, IO.Socket socket) : super(user, socket);

  // Emits
  joinCollaboration(
      String userId, String collaborationId, String type, String? password) {
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

  createCollaboration(String authorId, String title, String type, String? password) {
    print('Create Collab');
    if (type == "Protected") {
      socket.emit('collaboration:create', {
        'userId': authorId,
        'title': title,
        'type': type,
        'password': password
      });
    } else {
      socket.emit('collaboration:create', {
        'userId': authorId,
        'title': title,
        'type': type,
      });
    }
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

  // Receives
  load(callbackMessage) {
    socket.on('collaboration:load', (data) {
      print('Collaboration Load');
      Collaboration collaboration = Collaboration(
          collaborationId: 'id',
          actions: data["actions"],
          backgroundColor: data["backgroundColor"],
          memberCount: data["memberCount"],
          maxMemberCount: data["maxMemberCount"],
          width: data["width"],
          height: data["height"],
          members: data["members"]);
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
          memberCount:  data['currentCollaboratorCount'],
          maxMemberCount: data['maxCollaboratorCount'], //data["maxMemberCount"],
          members: []);
      Drawing drawing = Drawing(
          drawingId: data['drawingId'],
          thumbnailUrl: data['thumbnailUrl'],
          title: data['title'],
          authorUsername: data["authorUsername"],
          authorAvatar: data["authorAvatarUrl"].toString(),
          createdAt: data['createdAt'],
          collaboration: collaboration,
          type: 'type'); // "Protected", "Public" or "Private"
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
          maxMemberCount: data["maxMemberCount"],
          width: data["width"],
          height: data["height"],
          members: data["members"]);
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

  initializeChannelSocketEvents(callbackChannel) {
    load(callbackChannel);

    joined(callbackChannel);

    connected(callbackChannel);

    created(callbackChannel);

    updated(callbackChannel);

    deleted(callbackChannel);

    left(callbackChannel);

    print("initialized Collaboration socket events");
  }
}
