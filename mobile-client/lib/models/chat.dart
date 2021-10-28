class Chat {
  final String name, id, type;//, lastMessage;
  final bool is_owner;
  final String collaboration_id, updated_at;

  Chat( {
    required this.id,
    required this.type,
    required this.name,
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