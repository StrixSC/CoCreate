import 'drawing.dart';

class Team {
  String id, name, bio, type, mascot, thumbnailUrl, createdAt;
  String authorUsername, authorAvatarUrl;
  int memberCount, maxMemberCount, onlineMemberCount;
  String? password;
  List<TeamMember> members = [];
  List<Drawing> drawings = [];

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
    this.thumbnailUrl = "",
    this.createdAt = "",
    this.mascot = "",
    this.password,
    this.authorUsername = "Admin",
    this.authorAvatarUrl = "",
    required this.members,
  });
}

class TeamMember {
  String? username = "";
  String? userId = "";
  String? avatarUrl = "";
  String? type = "";
  String? drawingId = "";
  String? status = "";
  String? joinedOn = "";
  bool? isActive = false;

  TeamMember({
    this.username,
    this.userId,
    this.avatarUrl,
    this.status,
    this.type,
    this.joinedOn,
    this.isActive,
    this.drawingId = "",
  });
}