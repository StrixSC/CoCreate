import 'package:Colorimage/utils/rest/channels_api.dart';
import 'package:Colorimage/utils/rest/users_api.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'authentification_api.dart';
import 'package:dio/dio.dart';

class RestApi  {
  // final String _token;
  late AuthenticationAPI auth;
  late ChannelAPI channel;
  late UsersAPI user;

  Dio dio = Dio(BaseOptions(
    baseUrl: dotenv.env['SERVER_URL'] ?? "localhost:3000",
    connectTimeout: 5000,
    receiveTimeout: 3000,
  ));

  // RestApi() { // LOOK AT FACTORY FUNCTIONS (ASYNC INSIDE CONSTRUCTOR)
  //   _token = await FirebaseAuth.instance.currentUser!.getIdToken();
  //   auth = AuthenticationAPI(dio);
  //   channel = ChannelAPI(dio);
  //   user = UsersAPI(dio);
  // }
  //
  // Dio addInterceptors(Dio dio) {
  //   return dio..interceptors.add(InterceptorsWrapper(
  //       onRequest: (RequestOptions options) => requestInterceptor(options),
  //       onResponse: (Response response) => responseInterceptor(response),
  //       onError: (DioError dioError) => errorInterceptor(dioError)));
  // }



  dynamic requestInterceptor(RequestOptions options) async {
    if (options.headers.containsKey("requiresToken")) {
      //remove the auxiliary header
      options.headers.remove("requiresToken");

      var header = "Header";

      options.headers.addAll({"Header": "$header${DateTime.now()}"});

      return options;
    }
  }

}