import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';
import 'package:http_interceptor/http/intercepted_http.dart';

class TeamsAPI {
  final String? _url = dotenv.env['SERVER_URL'] ?? "localhost:3000";

  final InterceptedHttp http;

  TeamsAPI(this.http);

  Future<Response> fetchTeams(String? filter, int offset, int limit,
      String? type, bool amOwner, bool amMember, bool removeFull) async {
    final queryParameters = {
      'offset': offset.toString(),
      'limit': limit.toString(),
      'removeFull': removeFull.toString(),
      'amMemner': filter.toString(),
      'amOwner': amOwner.toString(),
    };
    if (type != null) {
      queryParameters['type'] = type;
    }
    if (filter != null) {
      queryParameters['filter'] = filter;
    }
    var url = Uri.http(_url!, '/api/teams', queryParameters);
    var response = await http.get(url);
    return response;
  }

  Future<Response> fetchUserTeams(
      String? filter, int offset, int limit, String? type) async {
    final queryParameters = {
      'offset': offset.toString(),
      'limit': limit.toString(),
    };
    if (type != null) {
      queryParameters['type'] = type;
    }
    if (filter != null) {
      queryParameters['filter'] = filter;
    }
    var url = Uri.http(_url!, '/api/teams', queryParameters);
    var response = await http.get(url);
    return response;
  }

  Future<Response> fetchTeamById(String id) async {
    var url = Uri.http(_url!, '/api/teams/$id');
    var response = await http.get(url);
    return response;
  }
}
