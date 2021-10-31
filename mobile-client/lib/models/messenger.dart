import 'dart:convert';

import 'package:Colorimage/models/user.dart';
import 'package:Colorimage/screens/chat/chat.dart';
import 'package:Colorimage/utils/rest/channels_api.dart';
import 'package:Colorimage/utils/rest/users_api.dart';
import 'package:Colorimage/utils/socket/channel.dart';
import 'package:flutter/cupertino.dart';

import 'chat.dart';

class Messenger extends ChangeNotifier{
  User user;
  List<Chat> userChannels = [];
  List<Chat> allChannels = [];
  bool isChannelSelected = false;
  late ChannelSocket socket;


  Messenger(this.user, this.userChannels, this.allChannels) {
    fetchChannels();
    fetchAllChannels();
  }

  void setSocket(channelSocket) {
    socket = channelSocket;
  }

  void updateUser(User updatedUser) {
    user = updatedUser;
    notifyListeners();
  }

  void updateUserChannels(List<Chat> updatedUserChannels) {
    userChannels = updatedUserChannels;
    notifyListeners();
  }

  void addUserChannel(Chat channel) {
    userChannels.add(channel);
    notifyListeners();
  }

  void removeUserChannel(String channelId) {
    userChannels.removeWhere((userChannel) => userChannel.id == channelId);
    notifyListeners();
  }

  void updateUserChannelName(String name, String updatedAt, String channelId) {
    int index = userChannels.indexWhere((channel) => channel.id == channelId);
    userChannels[index].name = name;
    userChannels[index].updated_at = updatedAt;
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

  Future<void> fetchChannels() async {
    UsersAPI rest = UsersAPI(user);
    var  response = await rest.fetchUserChannels();
    if (response.statusCode == 200) {
      var jsonResponse = json.decode(response.body) as List<dynamic>;//Map<String, dynamic>;
      print('fetchChannels: ');
      print(jsonResponse);
      List<Chat> userChannels = [];
      for (var channel in jsonResponse) {
        userChannels.add(Chat(name: channel['name'], id: channel['channel_id'], type: channel['type'],
            is_owner: channel['is_owner'], messages: []));
      }
      updateUserChannels(userChannels);
    } else {
      print('Request failed with status: ${response.body}.');
      updateUserChannels([]);
    }
  }

  Future<void> fetchAllChannels() async {
    ChannelAPI rest = ChannelAPI(user);
    var  response = await rest.fetchChannels();
    if (response.statusCode == 200) {
      var jsonResponse = json.decode(response.body) as List<dynamic>;//Map<String, dynamic>;
      print('fetchAllChannels');
      print(jsonResponse);
      List<Chat> allChannels = [];
      for (var channel in jsonResponse) {
        allChannels.add(Chat(name: channel['name'], id: channel['channel_id'], type: channel['type'],
            updated_at: channel['updated_at'], messages: []));
      }
      updateAllChannels(allChannels);
    } else {
      print('Request failed with status: ${response.body}.');
      updateAllChannels([]);
    }
  }

  List<Chat> getAvailableChannels() {
    List<Chat> availableChats = allChannels;
    for (Chat userChat in userChannels) {
      allChannels.removeWhere((allChat) => allChat.name == userChat.name);
    }
    return availableChats;
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
        addUserChannel(channel);
        break;
      case 'created':
        Chat channel = data as Chat;
        addUserChannel(channel);
        break;
      case 'left':
        String channelId = data as String;
        removeUserChannel(channelId);
        break;
      case 'deleted':
        String channelId = data as String;
        removeUserChannel(channelId);
        break;
      case 'updated':
        Chat channel = data as Chat;
        updateUserChannelName(channel.name, channel.updated_at, channel.id);
        break;
      default:
        print("Invalid socket event");
    }
  }
}