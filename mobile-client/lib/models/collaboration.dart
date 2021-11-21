class Collaboration {
  String collaborationId;
  List actions; // change this to List<Action> when Action is ready
  String title, authorUsername, authorAvatar, backgroundColor, type;
  int memberCount, maxMemberCount, width, height;
  List<Member> members;

  Collaboration({
    required this.collaborationId,
    required this.actions,
    required this.title,
    required this.authorUsername,
    required this.authorAvatar,
    required this.backgroundColor,
    required this.memberCount,
    required this.maxMemberCount,
    required this.width,
    required this.height,
    required this.members,
    required this.type,
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
