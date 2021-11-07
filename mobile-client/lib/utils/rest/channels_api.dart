//importing HTTP package for fetching and consuming HTTP resources
import 'package:Colorimage/models/user.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

const JSON_CONTENT_TYPE = {
  "Content-Type": "application/json",
  "withCredentials": "true"
};

class ChannelAPI {
  final String? _url = dotenv.env['SERVER_URL'] ?? "localhost:3000";
  User user;

  ChannelAPI(this.user);

  // Fetch all channels
  Future<http.Response> fetchChannels() async {
    var url = Uri.http(_url!, '/api/channels/');
    var response = await http.get(url, headers: {"cookie": user.cookie});
    return response;
  }

  // Create a channel
  // body : { name: "" }
  Future<http.Response> createChannel(body) async {
    var url = Uri.http(_url!, '/api/channels/create');
    var response = await http.post(url,
        headers: {"Content-Type": "application/json", "cookie": user.cookie},
        body: body);
    return response;
  }

  // Fetch all relevant information pertaining to that channel.
  // The request must be from a user that has access to the channel.
  Future<http.Response> fetchChannel(id) async {
    var url = Uri.http(_url!, '/api/channels/$id');
    var response = await http.get(url, headers: {"cookie": user.cookie});
    return response;
  }

  // Fetch all messages in a channel
  Future<http.Response> fetchChannelMessages(id) async {
    var url = Uri.http(_url!, '/api/channels/$id/messages');
    var response = await http.get(url, headers: {"cookie": user.cookie});
    return response;
  }
}
