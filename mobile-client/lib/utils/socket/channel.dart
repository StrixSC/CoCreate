import 'package:Colorimage/models/chat.dart';
import 'package:Colorimage/models/user.dart';
import 'package:Colorimage/utils/socket/socket_service.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class ChannelSocket extends Socket {
  ChannelSocket(User user, IO.Socket socket) : super(user, socket);

  // Emits
  joinChannel(channelId) {
    socket.emit('channel:join', {'channelId': channelId});
  }

  createChannel() {}

  leaveChannel(channelId) {}

  updateChannel() {}

  deleteChannel(channelId) {}

  // Receives
  joinedChannel(callbackChannel) {
    socket.on('', (data) {
      print('Joined channel');
      var message = Chat(
          id: data['channel_id'],
          name: data['name'],
          collaboration_id: data['collaboration_id'],
          updated_at: data['updated_at'],
          type: 'Public');
      callbackChannel(message);
    });
  }

  createdChannel(channelId) {}

  leftChannel(channel)  {}

  updatedChannel() {}

  deletedChannel(channelId) {}

}