import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';
import 'package:http_interceptor/http/intercepted_http.dart';

class CollaborationAPI {
  final String? _url = dotenv.env['SERVER_URL'] ?? "localhost:3000";

  final InterceptedHttp http;

  CollaborationAPI(this.http);

  // Fetch drawings
  // filter : Filter to apply
  // offset : Amount of records to skip. Use this for pagination. Defauls to 0
  // limit  : Amount of records to take. Use this for pagination. Defaults to 50.
  Future<Response> fetchDrawings(String? filter, int offset, int limit) async {
    final queryParameters = {
      'offset': offset.toString(),
      'limit': limit.toString(),
    };
    if (filter != null) {
      queryParameters['filter'] = filter;
    }
    var url = Uri.http(_url!, '/api/gallery/', queryParameters);
    var response = await http.get(url);
    return response;
  }
}
