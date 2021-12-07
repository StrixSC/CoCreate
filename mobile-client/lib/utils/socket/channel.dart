import 'package:Colorimage/models/chat.dart';
import 'package:Colorimage/screens/chat/chat.dart';
import 'package:Colorimage/screens/login/kickout.dart';
import 'package:Colorimage/utils/socket/socket_service.dart';
import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

import '../../app.dart';

class ChannelSocket {
  User user;
  IO.Socket socket;

  ChannelSocket({required this.user, required this.socket});

  // Emits
  sendMessage(message, channelId) {
    socket.emit('channel:send', {'message': message, 'channelId': channelId});
  }

  joinChannel(channelId) {
    socket.emit('channel:join', {'channelId': channelId});
  }

  createChannel(channelName) {
    socket.emit('channel:create', {'channelName': channelName});
  }

  leaveChannel(channelId) {
    socket.emit('channel:leave', {'channelId': channelId});
  }

  updateChannel(channelId, channelName) {
    socket.emit(
        'channel:update', {'channelId': channelId, 'channelName': channelName});
  }

  deleteChannel(channelId) {
    socket.emit('channel:delete', {'channelId': channelId});
  }

  // Receives
  userInitialized(callbackMessage) {
    socket.on('user:initialized', (data) {
      print('User initialized');
      // print(data);
      // callbackMessage('sent', data);
    });
  }
  // TODO: brin to another page saying already logged in somewhere else
  userInitExeption(callbackMessage) {
    socket.on('user:init:exception', (data) {
      navigatorKey.currentState!.pushReplacement(MaterialPageRoute (
        builder: (BuildContext context) => Kickout(),
      ));
      // callbackMessage('sent', data);
    });
  }
  sentMessage(callbackMessage) {
    socket.on('channel:sent', (data) {
      ChatMessage message = ChatMessage(
          messageId: data['messageId'],
          channelId: data['channelId'],
          text: data['message'],
          username: user.displayName as String,
          message_username: data['username'],
          timestamp: data['createdAt']);
      callbackMessage('sent', message);
    });
  }

  joinedChannel(callbackChannel) {
    socket.on('channel:joined', (data) {
      print('DATA:');
      print(data);
      Chat channel = Chat(
        id: data['channelId'] ?? '',
        name: data['channelName'] ?? '',
        type: data['channelType'] ?? '',
        messages: [],
        onlineMembers: data['online_members'] ?? [],
      );
      callbackChannel('joined', channel);
    });
  }

  joinedChannelFinished(callbackChannel) {
    socket.on('channel:join:finished', (data) {
      alert('Succès!', 'La chaine a été joint!');
    });
  }

  createdChannel(callbackChannel) {
    socket.on('channel:created', (data) {
      Chat channel = Chat(
          id: data['channelId'],
          name: data['channelName'],
          ownerUsername: data['ownerUsername'],
          collaborationId: data['collaborationId'],
          updatedAt: data['updatedAt'],
          messages: [],
          type: data['channelType'] ?? '',
          onlineMembers: []);
      callbackChannel('created', channel);
    });
  }

  createdChannelFinished(callbackChannel) {
    socket.on('channel:create:finished', (data) {
      alert('Succès!', 'La chaine a été créé!');
    });
  }

  leftChannel(callbackChannel) {
    socket.on('channel:left', (data) {
      print(data);
      // String channelId = data['channelId'];
      String channelType =  data['channelType'] ?? '';
      callbackChannel('left', channelType);
    });
  }

  leftChannelFinished(callbackChannel) {
    socket.on('channel:leave:finished', (data) {
      alert('Succès!', 'La chaine a été quitté!');
    });
  }

  updatedChannel(callbackChannel) {
    socket.on('channel:updated', (data) {
      print(data);
      // Chat channel = Chat(
      //   id: data['channelId'],
      //   name: data['channelName'],
      //   updatedAt: data['updatedAt'],
      //   type: data['channel_type'] ?? '',
      //   messages: [],
      //   onlineMembers: data['online_members'],
      // );
      callbackChannel('updated', 'channel');
    });
  }

  deletedChannel(callbackChannel) {
    socket.on('channel:deleted', (data) {
      print(data);
      String channelId = data['channelId'];
      callbackChannel('deleted', channelId);
    });
  }

  deletedChannelFinished(callbackChannel) {
    socket.on('channel:delete:finished', (data) {
      alert('Succès!', 'La chaine a été supprimé!');
    });
  }

  initializeChannelSocketEvents(callbackChannel) {

    userInitialized(callbackChannel);

    userInitExeption(callbackChannel);

    sentMessage(callbackChannel);

    joinedChannel(callbackChannel);
    joinedChannelFinished(callbackChannel);

    createdChannel(callbackChannel);
    createdChannelFinished(callbackChannel);

    leftChannel(callbackChannel);
    leftChannelFinished(callbackChannel);

    updatedChannel(callbackChannel);

    deletedChannel(callbackChannel);
    deletedChannelFinished(callbackChannel);
  }

  void alert(type, description) {
    AwesomeDialog(
      context: navigatorKey.currentContext as BuildContext,
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
