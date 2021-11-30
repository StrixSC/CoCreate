import 'package:Colorimage/models/collaboration.dart';

class Drawing {
  String drawingId, thumbnailUrl, title, type, authorUsername, authorAvatar;
  String createdAt; // change to date?
  String? updatedAt;
  Collaboration collaboration;

  Drawing({
    required this.drawingId,
    this.thumbnailUrl = "",
    required this.title,
    required this.authorUsername,
    required this.authorAvatar,
    required this.createdAt,
    required this.collaboration,
    required this.type,
  });
}