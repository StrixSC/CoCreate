import 'package:flutter/material.dart';
import 'package:flutter_chat_bubble/bubble_type.dart';
import 'package:flutter_chat_bubble/chat_bubble.dart';
import 'package:flutter_chat_bubble/clippers/chat_bubble_clipper_3.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

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
              if (this.username == this.message_username) {
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
                            shadowColor: null,
                            elevation: null,
                            alignment: Alignment.topRight,
                            margin: EdgeInsets.only(top: 10),
                            backGroundColor: Colors.blue,
                            child: Container(
                              constraints: BoxConstraints(
                                maxWidth:
                                    MediaQuery.of(context).size.width * 0.9,
                              ),
                              child: Text(
                                text,
                                style: TextStyle(
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
                      children: [
                        // Usually you dont have a Avatar showing for yourself
                        // Padding(
                        //     padding: EdgeInsets.fromLTRB(0, 45, 0, 0),
                        //     child: CircleAvatar(child: Text(this.username[0])))
                      ],
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
                            child: CircleAvatar(child: Text(this.username[0])))
                      ],
                    ),
                    Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                              padding: EdgeInsets.fromLTRB(15, 0, 0, 0),
                              child: Text(this.username,
                                  style:
                                      Theme.of(context).textTheme.headline6)),
                          ChatBubble(
                            clipper: ChatBubbleClipper3(
                                type: BubbleType.receiverBubble, radius: 20),
                            shadowColor: null,
                            elevation: null,
                            alignment: Alignment.topRight,
                            margin: EdgeInsets.only(top: 10),
                            backGroundColor: Colors.grey,
                            child: Container(
                              constraints: BoxConstraints(
                                maxWidth:
                                    MediaQuery.of(context).size.width * 0.9,
                              ),
                              child: Text(
                                text,
                                style: TextStyle(
                                    color: Colors.white, fontSize: 30),
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
  final String _username;
  final IO.Socket _socket;
  ChatScreen(this._username, this._socket);
  @override
  _ChatScreenState createState() =>
      _ChatScreenState(this._username, this._socket);
}

class _ChatScreenState extends State<ChatScreen> {
  final String _username;
  final IO.Socket _socket;
  _ChatScreenState(this._username, this._socket);
  final List<dynamic> _messages = [];
  final _textController = TextEditingController();
  bool _validate = false;
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();

    _socket.on('receive-message', (data) {
      var message = ChatMessage(
          text: data['message'],
          username: this._username,
          message_username: data['username'],
          timestamp: data['timestamp']);
      setState(() {
        _messages.insert(0, message);
      });
      _focusNode.requestFocus();
    });

    _socket.on('user-connection', (user) {
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

    _socket.on('user-disconnect', (user) {
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
    _socket.dispose();
    super.dispose();
  }

  void _handleSubmitted(String text) {
    setState(() {
      _validate =
          _textController.text.isEmpty || _textController.text.trim().isEmpty;
    });
    if (!_validate) {
      _textController.clear();
      this._socket.emit('send-message', {'message': text});
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
      data: IconThemeData(color: Theme.of(context).colorScheme.secondary),
      child: Container(
        height: 75,
        margin: const EdgeInsets.symmetric(horizontal: 8.0),
        child: Row(
          children: [
            Flexible(
              child: TextField(
                style: TextStyle(fontSize: 25),
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
      appBar: AppBar(
        leading: IconButton(
          icon: Tooltip(
              message: 'Se déconnecter',
              child: new Icon(Icons.arrow_back_ios,
                  color: Colors.black, size: 30)),
          onPressed: () => Navigator.of(context).pop(),
        ),
        backgroundColor: Colors.white,
        title: Center(
            child: Text(
          'Chat Publique',
          style: TextStyle(fontSize: 35, color: Colors.blue),
        )),
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
