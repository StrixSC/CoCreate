import 'package:Colorimage/screens/chat/chat.dart';

class Chat {
  String name, id, type;//, lastMessage;
  bool is_owner;
  String collaboration_id, updated_at;
  List<ChatMessage> messages;

  Chat( {
    required this.id,
    required this.type,
    required this.name,
    required this.messages,
    // required this.lastMessage,
    this.is_owner  = false,
    this.collaboration_id = '',
    this.updated_at = '',

  });
  @override
  String toString() => name;

  @override
  operator ==(o) => o is Chat && o.name == name;

  @override
  int get hashCode => name.hashCode ^ name.hashCode ^ name.hashCode;
}