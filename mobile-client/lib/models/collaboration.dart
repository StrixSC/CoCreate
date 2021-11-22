import 'package:flutter/material.dart';

class Collaboration {
  String collaborationId;
  List actions; // change this to List<Action> when Action is ready
  Color backgroundColor;
  int memberCount, maxMemberCount, width, height;
  List<Member> members;

  Collaboration({
    this.collaborationId = 'NO ID AVAILABLE',
    this.actions = const [],
    this.backgroundColor = Colors.white,
    this.memberCount = 0,
    this.maxMemberCount = 0,
    this.width = 1280,
    this.height = 750,
    this.members = const [],
  });
}

class Member {
  String? username = "";
  String? userId = "";
  String? avatarUrl = "";
  String? type = "";
  bool? isActive = false;

  Member({
    required this.username,
    required this.userId,
    required this.avatarUrl,
    required this.type,
    required this.isActive,
  });
}