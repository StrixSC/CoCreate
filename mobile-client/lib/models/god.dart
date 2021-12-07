
class Profile {
  String username = "";
  String avatar_url = "";
}

class Log {
  String type = "";
  String created_at = "";
  String collaboration_id = "";
}

class Account {
  String first_name = "";
  String last_name = "";
  String allow_searching = "";
}

class UserResponse {
  String user_id = "";
  String email = "";
  List authored_collaborations = [];
  List collaborations = [];
  List teams = [];
  String profile = "";
  List logs = [];
  Map account = {};
  Map stats = {};
}

class AuthoredCollaboration {
  String author_id = "";
}

class Collaboration {
  String collaboration_id = "";
}

class Stats {
  String total_collaboration_time = "";
  int total_collaboration_sessions = 0;
  String updated_at = "";
  String average_collaboration_time = "";
  int authored_collaboration_count = 0;
  int joined_collaboration_count = 0;
  int team_count = 0;
}