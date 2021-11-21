import 'package:Colorimage/models/collaboration.dart';

class Drawing {
  String drawingId, thumbnailUrl, title;
  String createdAt; // change to date?
  Collaboration collaboration;

  Drawing({
    required this.drawingId,
    required this.thumbnailUrl,
    required this.title,
    required this.createdAt,
    required this.collaboration,
  });
}