import 'dart:ui';

import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/screens/chat/chat.dart';

class Chat {
  String name, id, type, ownerUsername, lastReadMessage;
  String? collaborationId, updatedAt;
  List<ChatMessage> messages;
  List onlineMembers = [];
  Color color;

  Chat({
    required this.id,
    required this.name,
    required this.messages,
    this.lastReadMessage = "",
    this.ownerUsername = "",
    this.collaborationId = '',
    this.updatedAt = '',
    this.type = "",
    required this.onlineMembers,
    this.color = kPrimaryColor,
  });

  @override
  String toString() => name;

  @override
  operator ==(o) => o is Chat && o.name == name;

  @override
  int get hashCode => name.hashCode ^ name.hashCode ^ name.hashCode;
}
