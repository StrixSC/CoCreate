
import 'package:Colorimage/models/user.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class UsersAPI {
  final String? _url = dotenv.env['SERVER_URL'] ?? "localhost:3000";
  User user;

  UsersAPI(this.user);

  /// USERS
  Future<http.Response> fetchUser() async {
    var url = Uri.http(_url!, '/api/users/${user.id}');
    var response = await http.get(url, headers: {'cookie': user.cookie});
    return response;
  }

  Future<http.Response> fetchProfiles() async {
    var url = Uri.http(_url!, '/api/users/profile');
    var response = await http.get(url, headers: {'cookie': user.cookie});
    return response;
  }

  Future<http.Response> fetchProfile() async {
    var url = Uri.http(_url!, '/api/users/profile/${user.username}');
    var response = await http.get(url, headers: {'cookie': user.cookie});
    return response;
  }

  Future<http.Response> fetchUserChannels() async {
    var url = Uri.http(_url!, '/api/users/${user.id}/channels');
    var response = await http.get(url, headers: {'cookie': user.cookie});
    return response;
  }
}