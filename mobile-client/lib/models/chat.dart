import 'package:Colorimage/screens/chat/chat.dart';

class Chat {
  String name, id, type, ownerUsername, lastReadMessage;
  String? collaborationId, updatedAt;
  List<ChatMessage> messages;

  Chat({
    required this.id,
    required this.name,
    required this.messages,
    this.lastReadMessage = "",
    this.ownerUsername = "",
    this.collaborationId = '',
    this.updatedAt = '',
    this.type = "",
  });

  @override
  String toString() => name;

  @override
  operator ==(o) => o is Chat && o.name == name;

  @override
  int get hashCode => name.hashCode ^ name.hashCode ^ name.hashCode;
}
