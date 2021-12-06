import 'dart:convert';

import 'dart:math';
import 'package:Colorimage/models/chat.dart';
import 'package:awesome_dialog/awesome_dialog.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:Colorimage/screens/chat/chat.dart';
import 'package:Colorimage/utils/rest/rest_api.dart';
import 'package:Colorimage/utils/socket/channel.dart';
import 'package:flutter/cupertino.dart';

import '../app.dart';
import '../models/chat.dart';
import 'dart:math';
class Messenger extends ChangeNotifier {
  UserCredential? auth;
  List<Chat> userChannels = [];
  List<Chat> oldChannels = [];
  List<Chat> allChannels = [];
  List<Chat> availableChannel = [];
  bool isChannelSelected = false;
  int currentSelectedChannelIndex = 0;
  late ChannelSocket channelSocket;
  late Function openDrawer;

  bool isDrawing = false;
  late Function setIndex;
  int tabIndex = 0;
  Messenger(this.auth, this.userChannels, this.allChannels);

  void setSocket(socket) {
    channelSocket = socket;
    channelSocket.socket.on('connect', (_) {
      print("Channel socket events initialized");
      channelSocket.initializeChannelSocketEvents(callbackChannel);
      channelSocket.socket.emit('user:init');
      joinAllUserChannels();
    });

    notifyListeners();
  }

  void updateUser(UserCredential updatedUser) {
    auth = updatedUser;
    notifyListeners();
  }

  void setLastMessage(lastMessage, index) {
    userChannels[index].lastReadMessage = lastMessage;
    notifyListeners();
  }

  void updateUserChannels(List<Chat> updatedUserChannels) {
    userChannels = updatedUserChannels;
    notifyListeners();
  }

  void addUserChannel(Chat channel) {
    if (!userChannels.contains(channel)) {
      userChannels.add(channel);
      notifyListeners();
      alert('Succès!', 'La chaine a été supprimer!');
    }
  }

  void addAllChannel(Chat channel) {
    if (!allChannels.contains(channel)) {
      allChannels.add(channel);
      notifyListeners();
    }
  }

  void removeUserChannel(String channelId) {
    userChannels.removeWhere((userChannel) => userChannel.id == channelId);
    notifyListeners();
    alert('Succès!', 'La chaine a été supprimer!');
  }

  void updateUserChannelName(String name, String updatedAt, String channelId) {
    int index = userChannels.indexWhere((channel) => channel.id == channelId);
    userChannels[index].name = name;
    userChannels[index].updatedAt = updatedAt;
    notifyListeners();
  }

  void updateAllChannels(List<Chat> updatedAllChannels) {
    allChannels = updatedAllChannels;
    notifyListeners();
  }

  void toggleSelection() {
    isChannelSelected = !isChannelSelected;
    notifyListeners();
  }

  void joinAllUserChannels() {
    for (var channel in userChannels) {
      channelSocket.joinChannel(channel.id);
    }
  }

  Future<void> fetchChannels() async {
    RestApi rest = RestApi();
    var response = await rest.user.fetchUserChannels(auth!.user!);
    if (response.statusCode == 200) {
      var jsonResponse =
          json.decode(response.body) as List<dynamic>; //Map<String, dynamic>;
      List<Chat> useChannels = [];
      for (var channel in jsonResponse) {
        useChannels.add(Chat(
          name: channel['name'],
          id: channel['channel_id'],
          type: channel['channel_type'],
          ownerUsername: channel['owner_username'],
          messages: [],
          onlineMembers: channel['online_members'] ?? [],
          color: Colors.primaries[Random().nextInt(Colors.primaries.length)],
        ));
      }

      // todo: change to int i = 0.. if not working
      if(userChannels.isNotEmpty) {
        for(var newChannel in useChannels) {
          for(var oldChannel in userChannels) {
              if(newChannel.id == oldChannel.id) {
                newChannel.messages = oldChannel.messages;
                newChannel.lastReadMessage = oldChannel.lastReadMessage;
              }
          }
        }
      }
      updateUserChannels(useChannels);
    } else {
      print('Request failed with status: ${response.body}.');
      updateUserChannels([]);
    }
  }

  Future<void> fetchAllChannels() async {
    RestApi rest = RestApi();
    var response = await rest.channel.fetchChannels();
    if (response.statusCode == 200) {
      var jsonResponse =
          json.decode(response.body) as List<dynamic>; //Map<String, dynamic>;
      List<Chat> allChannels = [];
      for (var channel in jsonResponse) {
        allChannels.add(Chat(
          name: channel['name'],
          id: channel['channel_id'],
          type: channel['channel_type'] ?? 'None',
          ownerUsername: channel['owner_username'],
          updatedAt: channel['updated_at'],
          messages: [],
          onlineMembers: channel['online_members'] ?? [],
        ));
      }
      updateAllChannels(allChannels);
    } else {
      print('Request failed with status: ${response.body}.');
      updateAllChannels([]);
    }
  }

  Future<void> fetchChannelHistory(index) async {
    String channelId = userChannels[index].id;
    RestApi rest = RestApi();
    var response = await rest.channel.fetchChannelMessages(channelId);
    if (response.statusCode == 200) {
      var jsonResponse =
          json.decode(response.body) as List<dynamic>; //Map<String, dynamic>;
      List<ChatMessage> allMessages = [];
      for (var message in jsonResponse) {
        allMessages.add(ChatMessage(
          channelId: channelId,
          message_username: message['username'],
          text: message['message_data'],
          username: auth!.user!.displayName as String,
          messageId: message['message_id'],
          timestamp: message['timestamp'],
        ));
      }
      var reversedListMessages = allMessages.reversed.toList();
      userChannels[index].messages = reversedListMessages;
      notifyListeners();
    } else {
      print('Request failed with status: ${response.body}.');
    }
  }

  void getAvailableChannels() {
    print("availabel channels");
    fetchAllChannels();
    List<Chat> availableChats = allChannels;
    for (Chat userChat in userChannels) {
      availableChats.removeWhere((allChat) => allChat.name == userChat.name);
    }
    availableChannel = availableChats;
    notifyListeners();
  }

  void addMessage(channelId, message) {
    int index = userChannels.indexWhere((channel) => channel.id == channelId);
    userChannels[index].messages.insert(0, message);
    notifyListeners();
  }

  void callbackChannel(eventType, data) {
    switch (eventType) {
      case 'sent':
        ChatMessage message = data as ChatMessage;
        addMessage(message.channelId, message);
        break;
      case 'joined':
        Chat channel = data as Chat;
          fetchChannels();
          if(channel.type != 'Collaboration' && channel.type != 'Team'){alert('Succès!', 'La chaine a été joint!');}
        // Chat channel = data as Chat;
        // addUserChannel(channel);
        break;
      case 'created':
        Chat channel = data as Chat;
        channel.ownerUsername == auth!.user!.displayName
            ? fetchChannels()
            : getAvailableChannels();
        (channel.ownerUsername == auth!.user!.displayName && channel.type != 'Collaboration'  && channel.type != 'Team') ?
        alert('Succès!', 'La chaine a été créée!'): '';
        break;
      case 'left':
        print('Left Chat');
        String channelType = data;
        fetchChannels();
        if(channelType != 'Collaboration'  && channelType != 'Team'){alert('Succès!', 'La chaine a été quitter!');}
        // String channelId = data as String;
        // removeUserChannel(channelId);
        break;
      case 'deleted':
        print('Deleted Chat');
        fetchChannels();
        // String channelId = data as String;
        // removeUserChannel(channelId);
        break;
      case 'updated':
        // Chat channel = data as Chat;
        fetchChannels();
        // updateUserChannelName(
        //     channel.name, channel.updatedAt as String, channel.id);
        break;
      default:
        print("Invalid socket event");
    }
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
