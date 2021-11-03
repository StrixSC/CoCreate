//importing HTTP package for fetching and consuming HTTP resources
import 'package:Colorimage/models/user.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

const JSON_CONTENT_TYPE = {"Content-Type": "application/json", "withCredentials": "true"};

class AuthenticationAPI {
  final String? _url = dotenv.env['SERVER_URL'] ?? "localhost:3000";

  AuthenticationAPI();

  Future<http.Response> login(body) async {
    var url = Uri.http(_url!, '/auth/login');
    var response = await http.post(url, headers: JSON_CONTENT_TYPE, body: body, );
    return response;
  }

  Future<http.Response> logout(body) async {
    var url = Uri.http(_url!, '/auth/logout');
    var response = await http.post(url, headers: JSON_CONTENT_TYPE, body: body, );
    return response;
  }

  Future<http.Response> register(body) async {
    var url = Uri.http(_url!, '/auth/register');
    var response = await http.post(url, headers: JSON_CONTENT_TYPE, body: body, );
    return response;
  }

}