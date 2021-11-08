import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';
import 'package:http_interceptor/http/intercepted_http.dart';

class ChannelAPI {
  final String? _url = dotenv.env['SERVER_URL'] ?? "localhost:3000";

  final InterceptedHttp http;

  ChannelAPI(this.http);

  // Fetch all channels
  Future<Response> fetchChannels() async {
    var url = Uri.http(_url!, '/api/channels/');
    var response = await http.get(url);
    return response;
  }

  // Create a channel
  // body : { name: "" }
  Future<Response> createChannel(body) async {
    var url = Uri.http(_url!, '/api/channels/create');
    var response = await http.post(url,
        headers: {"Content-Type": "application/json"},
        body: body);
    return response;
  }

  // Fetch all relevant information pertaining to that channel.
  // The request must be from a user that has access to the channel.
  Future<Response> fetchChannel(id) async {
    var url = Uri.http(_url!, '/api/channels/$id');
    var response = await http.get(url);
    return response;
  }

  // Fetch all messages in a channel
  Future<Response> fetchChannelMessages(id) async {
    var url = Uri.http(_url!, '/api/channels/$id/messages');
    var response = await http.get(url);
    return response;
  }
}
