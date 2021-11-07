
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class UsersAPI {
  final String? _url = dotenv.env['SERVER_URL'] ?? "localhost:3000";

  /// USERS
  Future<http.Response> fetchUser(user) async {
    var url = Uri.http(_url!, '/api/users/${user.id}');
    var response = await http.get(url, headers: {});
    return response;
  }

  Future<http.Response> fetchProfiles(user) async {
    var url = Uri.http(_url!, '/api/users/profile');
    var response = await http.get(url, headers: {});
    return response;
  }

  Future<http.Response> fetchProfile(user) async {
    var url = Uri.http(_url!, '/api/users/profile/${user.username}');
    var response = await http.get(url, headers: {});
    return response;
  }

  Future<http.Response> fetchUserChannels(User user) async {
    var url = Uri.http(_url!, '/api/users/${user.uid}/channels');
    var response = await http.get(url, headers: {});
    return response;
  }
}