
/*  With Firebase integration, we do not need to have our own User object as
    it provides one. Keeping this temporarily just in case. */
class User {
  String id, email, username, avatar_url;
  bool isActive;

  User({
    this.id = '',
    this.email = '',
    this.username = '',
    this.avatar_url = '',
    this.isActive = false,
  });
}
