//importing HTTP package for fetching and consuming HTTP resources
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'authentification_api.dart';
import 'channels_api.dart';

const JSON_CONTENT_TYPE = {"Content-Type": "application/json", "withCredentials": "true"};

class ColorimageRestAPI with AuthenticationAPI, ChannelAPI {
  final String? _url = dotenv.env['SERVER_URL'] ?? "localhost:3000";


  ColorimageRestAPI();


  /// USERS
  Future<http.Response> fetchUser(id) async {
    var url = Uri.http(_url!, '/api/users/$id');
    var response = await http.get(url);
    return response;
  }

  Future<http.Response> fetchProfiles() async {
    var url = Uri.http(_url!, '/api/users/profile');
    var response = await http.get(url);
    return response;
  }

  Future<http.Response> fetchProfile(username) async {
    var url = Uri.http(_url!, '/api/users/profile/$username');
    var response = await http.get(url);
    return response;
  }


}