
import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http_dart;
import 'dart:io';
import 'dart:convert';
import 'dart:async';
import 'package:http_interceptor/http/intercepted_http.dart';

class UsersAPI {
  final String? _url = dotenv.env['SERVER_URL'] ?? "localhost:3000";

  final InterceptedHttp http;

  UsersAPI(this.http);

  /// USERS
  Future<http_dart.Response> fetchUserAccount() async {
    var url = Uri.http(_url!, '/api/users/account');
    var response = await http.get(url);
    return response;
  }

  Future<http_dart.Response> updatePassword(value) async {
    Map val = {'password': value};
    var url = Uri.http(_url!, '/auth/update/password');
    var body = json.encode(val);
    var response = await http.put(url,
        headers: {"Content-Type": "application/json"},
        body: body);
    return response;
  }

  Future<http_dart.Response> updatePasswordAvatar(value) async {
    Map val = {'value': value};
    var body = json.encode(val);
    var url = Uri.http(_url!, '/api/users/account/confidentiality');
    var response = await http.put(url,
        headers: {"Content-Type": "application/json"},
        body: body);
    return response;
  }

  Future<http_dart.Response> changeUserConfidentiality(value) async {
    Map val = {'value': value};
    var body = json.encode(val);
    var url = Uri.http(_url!, '/api/users/account/confidentiality');
    var response = await http.put(url,
        headers: {"Content-Type": "application/json"},
        body: body);
    return response;
  }



  Future<http_dart.Response> fetchProfiles(user) async {
    var url = Uri.http(_url!, '/api/users/profile');
    var response = await http.get(url);
    return response;
  }

  Future<http_dart.Response> fetchProfile(user) async {
    var url = Uri.http(_url!, '/api/users/profile/${user.username}');
    var response = await http.get(url);
    return response;
  }

  Future<http_dart.Response> fetchUserChannels(User user) async {
    var url = Uri.http(_url!, '/api/users/${user.uid}/channels');
    var response = await http.get(url);
    return response;
  }

  // TODO

  Future<http_dart.Response> fetchUserLogs(User user) async {
    var url = Uri.http(_url!, '/api/users/logs');
    var response = await http.get(url);
    return response;
  }

  Future<String> uploadUserAvatar(File file) async {
    var token = await FirebaseAuth.instance.currentUser!.getIdToken();

    Dio dio = Dio();
    dio.options.headers['Content-Type'] = 'multipart/form-data';
    dio.options.headers["Authorization"] = "Bearer $token";

    String fileName = file.path.split('/').last;
    FormData formData = FormData.fromMap({
      "file":
      await MultipartFile.fromFile(file.path, filename:fileName),
    });

    var response = await dio.post("/info", data: formData);
    return response.data['id'];
  }

  Future<http_dart.Response> fetchAvailableAvatars(User user) async {
    var url = Uri.http(_url!, '/api/users/avatars');
    var response = await http.get(url);
    return response;
  }

  Future<http_dart.Response> fetchAllProfiles(User user) async {
    var url = Uri.http(_url!, '/api/users/profile');
    var response = await http.get(url);
    return response;
  }

  Future<http_dart.Response> updateUsernameAvatar(User user, String avatarUrl) async {
    var url = Uri.http(_url!, '/api/users/profile');
    var response = await http.put(url);
    return response;
  }



  Future<http_dart.Response> fetchUserProfile(User user) async {
    var url = Uri.http(_url!, '/api/users/profile/${user.displayName}');
    var response = await http.get(url);
    return response;
  }
}