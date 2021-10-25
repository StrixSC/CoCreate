import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/user.dart';
import 'package:flutter/material.dart';
import 'package:flutter_chat_bubble/bubble_type.dart';
import 'package:flutter_chat_bubble/chat_bubble.dart';
import 'package:flutter_chat_bubble/clippers/chat_bubble_clipper_3.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:http/http.dart' as http;

class ChatMessage extends StatelessWidget {
  const ChatMessage({
    required this.text,
    required this.username,
    required this.message_username,
    required this.timestamp,
  });
  final String text;
  final String username;
  final String message_username;
  final String timestamp;

  @override
  Widget build(BuildContext context) {
    return Container(
        margin: const EdgeInsets.symmetric(vertical: 10.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            (() {
              if (username == message_username) {
                return Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          // Usually you know your name...
                          // Padding(
                          //     padding: EdgeInsets.fromLTRB(0, 0, 15, 0),
                          //     child: Text(this.username,
                          //         style:
                          //             Theme.of(context).textTheme.headline6)),
                          ChatBubble(
                            clipper:
                            ChatBubbleClipper3(type: BubbleType.sendBubble),
                            shadowColor: Colors.white,
                            elevation: 0,
                            alignment: Alignment.topRight,
                            margin: EdgeInsets.only(top: 10),
                            backGroundColor: kPrimaryColor,
                            child: Container(
                              color: kPrimaryColor,
                              constraints: BoxConstraints(
                                maxWidth:
                                MediaQuery.of(context).size.width * 0.9,
                              ),
                              child: Text(
                                text,
                                style: const TextStyle(
                                    color: Colors.white, fontSize: 30),
                              ),
                            ),
                          ),
                          Padding(
                              padding: EdgeInsets.fromLTRB(0, 10, 25, 0),
                              child: Text(this.timestamp)),
                        ]),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: const [],
                    ),
                  ],
                );
              } else {
                return Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Padding(
                            padding: EdgeInsets.fromLTRB(0, 45, 0, 0),
                            child: CircleAvatar(backgroundColor: kPrimaryColor, child: Text(this.message_username[0], style: TextStyle(color:Colors.white),)))
                      ],
                    ),
                    Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                              padding: EdgeInsets.fromLTRB(15, 0, 0, 0),
                              child: Text(this.message_username,
                                  style:
                                  Theme.of(context).textTheme.headline6)),
                          ChatBubble(
                            clipper: ChatBubbleClipper3(
                                type: BubbleType.receiverBubble, radius: 15),
                            shadowColor: Colors.white,
                            elevation: 0,
                            alignment: Alignment.topRight,
                            margin: EdgeInsets.only(top: 10),
                            backGroundColor: Colors.grey.shade300,
                            child: Container(
                              constraints: BoxConstraints(
                                maxWidth:
                                MediaQuery.of(context).size.width * 0.9,
                              ),
                              child: Text(
                                text,
                                style: const TextStyle(
                                    color: Colors.black, fontSize: 30),
                              ),
                            ),
                          ),
                          Padding(
                              padding: EdgeInsets.fromLTRB(25, 10, 0, 0),
                              child: Text(this.timestamp)),
                        ]),
                  ],
                );
              }
            }())
          ],
        ));
  }
}

class ChatScreen extends StatefulWidget {
  final User _user;
  final IO.Socket _socket;
  Function callback;
  ChatScreen(this._user, this._socket, this.callback, {Key? key}) : super(key: key);
  @override
  _ChatScreenState createState() =>
      _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final List<dynamic> _messages = [];
  final _textController = TextEditingController();
  bool _validate = false;
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();

    widget._socket.on('receive-message', (data) {
      var message = ChatMessage(
          text: data['message'],
          username: widget._user.username,
          message_username: data['username'],
          timestamp: data['timestamp']);
      setState(() {
        _messages.insert(0, message);
      });
      _focusNode.requestFocus();
    });

    widget._socket.on('user-connection', (user) {
      print('Someone connected');
      print(user);
      var newConnection = Container(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Center(
              child: Text(user['message'], style: TextStyle(fontSize: 25)),
            )
          ],
        ),
      );
      setState(() {
        _messages.insert(0, newConnection);
      });
      _focusNode.requestFocus();
    });

    widget._socket.on('user-disconnect', (user) {
      print('Someone disconnected');
      print(user);
      var newConnection = Container(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Center(
              child: Text(user['message'], style: TextStyle(fontSize: 25)),
            )
          ],
        ),
      );
      setState(() {
        _messages.insert(0, newConnection);
      });
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    widget._socket.dispose();
    super.dispose();
  }

  void _handleSubmitted(String text) {
    print('submitted :)');
    setState(() {
      _validate =
          _textController.text.isEmpty || _textController.text.trim().isEmpty;
    });
    if (!_validate) {
      _textController.clear();
      widget._socket.emit('send-message', {'message': text, 'channel': ''});
    }
  }

  void _handleChange(String text) {
    if (_validate) {
      setState(() {
        _validate = _textController.text.isEmpty;
      });
    }
  }

  Widget _buildTextComposer() {
    return IconTheme(
      data: const IconThemeData(color:kPrimaryColor),
      child: Container(
        height: 75,
        margin: const EdgeInsets.symmetric(horizontal: 8.0),
        child: Row(
          children: [
            Flexible(
              child: TextField(
                style: const TextStyle(fontSize: 25),
                controller: _textController,
                onSubmitted: _handleSubmitted,
                onChanged: _handleChange,
                decoration: InputDecoration(
                  hintText: 'Envoyer un message',
                  errorText:
                  _validate ? 'Le message ne peut pas être vide' : null,
                ),
                focusNode: _focusNode,
              ),
            ),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 4.0),
              child: IconButton(
                  iconSize: 34,
                  icon: const Icon(Icons.send),
                  color: kPrimaryColor,
                  onPressed: () {
                    _handleSubmitted(_textController.text);
                  }),
            )
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
            icon: const Tooltip(
                message: 'Se déconnecter',
                child: Icon(Icons.arrow_back,
                    color: Colors.black, size: 30)),
            onPressed: () => widget.callback()
        ),
        backgroundColor: Colors.white,
        title:  const Text(
          '',
          style: TextStyle(fontSize: 25, color: Colors.blue),
        ),
      ),
      body: Column(
        children: [
          Flexible(
            child: ListView.builder(
              padding: const EdgeInsets.all(8.0),
              reverse: true,
              itemBuilder: (_, index) => _messages[index],
              itemCount: _messages.length,
            ),
          ),
          const Divider(height: 1.0),
          Container(
            decoration: BoxDecoration(color: Theme.of(context).cardColor),
            child: _buildTextComposer(),
          ),
        ],
      ),
    );
  }
}
