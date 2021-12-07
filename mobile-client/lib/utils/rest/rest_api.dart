import 'package:Colorimage/utils/rest/channels_api.dart';
import 'package:Colorimage/utils/rest/collaboration_api.dart';
import 'package:Colorimage/utils/rest/rest_api_interceptor.dart';
import 'package:Colorimage/utils/rest/teams_api.dart';
import 'package:Colorimage/utils/rest/users_api.dart';
import 'package:http_interceptor/http/intercepted_http.dart';
import 'authentification_api.dart';

class RestApi  {
  // final String _token;
  late AuthenticationAPI auth;
  late ChannelAPI channel;
  late UsersAPI user;
  late CollaborationAPI drawing;
  late TeamsAPI team;

  final http = InterceptedHttp.build(interceptors: [
    RestApiInterceptor(),
  ]);

  RestApi() {
    auth = AuthenticationAPI(http);
    channel = ChannelAPI(http);
    user = UsersAPI(http);
    drawing = CollaborationAPI(http);
    team = TeamsAPI(http);
  }

}