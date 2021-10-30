import 'dart:convert';

import 'package:Colorimage/models/user.dart';
import 'package:Colorimage/utils/rest/channels_api.dart';
import 'package:Colorimage/utils/rest/users_api.dart';
import 'package:flutter/cupertino.dart';

import 'chat.dart';

class Messenger extends ChangeNotifier{
  User user;
  List<Chat> userChannels = [];
  List<Chat> allChannels = [];
  bool isChannelSelected = false;

  Messenger(this.user, this.userChannels, this.allChannels) {
    fetchChannels();
    fetchAllChannels();
  }

  void updateUser(updatedUser) {
    user = updatedUser;
    notifyListeners();
  }

  void updateUserChannels(updatedUserChannels) {
    userChannels = updatedUserChannels;
    notifyListeners();
  }

  void updateAllChannels(updatedAllChannels) {
    allChannels = updatedAllChannels;
    notifyListeners();
  }

  void toggleSelection() {
    isChannelSelected = !isChannelSelected;
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
            is_owner: channel['is_owner']));
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
            updated_at: channel['updated_at']));
      }
      updateUserChannels(allChannels);
    } else {
      print('Request failed with status: ${response.body}.');
      updateUserChannels([]);
    }
  }
}