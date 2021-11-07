import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';
import 'package:http_interceptor/http/intercepted_http.dart';

var JSON_CONTENT_TYPE = {"Content-Type": "application/json", "withCredentials": "true"};

class AuthenticationAPI {
  final String? _url = dotenv.env['SERVER_URL'] ?? "localhost:3000";
  final InterceptedHttp http;

  AuthenticationAPI(this.http);

  Future<Response> login(token) async {
    var url = Uri.http(_url!, '/auth/login');
    var response = await http.get(url);
    return response;
  }

  Future<Response> logout(token) async {
    var url = Uri.http(_url!, '/auth/logout');
    var response = await http.get(url, headers: {"Authorization": "Bearer $token"});
    return response;
  }

  Future<Response> register(body) async {
    var url = Uri.http(_url!, '/auth/register');
    // JSON_CONTENT_TYPE["Authorization"] = "Bearer $token";
    var response = await http.post(url, headers: JSON_CONTENT_TYPE, body: body, );
    return response;
  }

}