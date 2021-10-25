class User {
  final String user_id, email, username, avatar_url;
  final bool isActive;
  final String? cookie;

  User({
    this.user_id = '',
    this.email = '',
    this.username = '',
    this.avatar_url = '',
    this.isActive = false,
    this.cookie = '',
  });

}
