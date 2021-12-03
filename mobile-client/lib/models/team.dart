class Team {
  String id, name, bio, type, mascot;
  String authorUsername, authorAvatarUrl;
  int memberCount, maxMemberCount, onlineMemberCount;
  String? password;
  List<TeamMember> members = [];

  Map types =
    { 'Protected': 'Protégé',
    'Public': 'Public' }
  ;

  Team({
    this.id = '',
    this.name = "Default",
    this.bio = "No bio found",
    this.maxMemberCount = 1,
    this.memberCount = 1,
    this.onlineMemberCount = 0,
    this.type = "Public",
    this.mascot = "",
    this.password,
    this.authorUsername = "Admin",
    this.authorAvatarUrl = "",

  });
}

class TeamMember {
  String? username = "";
  String? userId = "";
  String? avatarUrl = "";
  String? type = "";
  String? drawingId = "";
  bool? isActive = false;


  TeamMember({
    this.username,
    this.userId,
    this.avatarUrl,
    this.type,
    this.isActive,
    this.drawingId = "",
  });
}