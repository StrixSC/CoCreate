
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';
import 'package:http_interceptor/http/intercepted_http.dart';

class UsersAPI {
  final String? _url = dotenv.env['SERVER_URL'] ?? "localhost:3000";

  final InterceptedHttp http;

  UsersAPI(this.http);

  /// USERS
  Future<Response> fetchUser(user) async {
    var url = Uri.http(_url!, '/api/users/${user.id}');
    var response = await http.get(url, headers: {});
    return response;
  }

  Future<Response> fetchProfiles(user) async {
    var url = Uri.http(_url!, '/api/users/profile');
    var response = await http.get(url, headers: {});
    return response;
  }

  Future<Response> fetchProfile(user) async {
    var url = Uri.http(_url!, '/api/users/profile/${user.username}');
    var response = await http.get(url, headers: {});
    return response;
  }

  Future<Response> fetchUserChannels(User user) async {
    var url = Uri.http(_url!, '/api/users/${user.uid}/channels');
    var response = await http.get(url, headers: {});
    return response;
  }
}