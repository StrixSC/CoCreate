import 'package:flutter/material.dart';
import '../models/drawing.dart';

class Collaboration {
  String collaborationId;
  List actions = [];
  Map actionsMap = <String, ShapeAction>{};
  Map selectedItems = <String, String>{};
  Color backgroundColor;
  int memberCount, maxMemberCount, activeMemberCount, width, height;
  List<Member> members = [];

  Collaboration({
    this.collaborationId = 'NO ID AVAILABLE',
    required this.actionsMap,
    required this.actions,
    this.backgroundColor = Colors.white,
    this.memberCount = 0,
    this.maxMemberCount = 0,
    this.activeMemberCount = 0,
    this.width = 1280,
    this.height = 750,
    required this.members,
    required this.selectedItems,
  });
}

class Member {
  String? username = "";
  String? userId = "";
  String? avatarUrl = "";
  String? type = "";
  String? drawingId = "";
  bool? isActive = false;

  Member({
    this.username,
    this.userId,
    this.avatarUrl,
    this.type,
    this.isActive,
    this.drawingId = "",
  });
}
