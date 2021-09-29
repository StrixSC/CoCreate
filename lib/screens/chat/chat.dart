import 'package:flutter/material.dart';

class Chat extends StatelessWidget {
  final String _username;
  final String _ipAddress;

  Chat(this._username, this._ipAddress);
  final _textController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: null,
        body: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              IconTheme(
                  data: IconThemeData(
                      color: Theme.of(context).colorScheme.secondary),
                  child: Container(
                    margin: EdgeInsets.symmetric(horizontal: 8.0),
                    child: Row(
                      children: [
                        Flexible(
                          child: TextField(
                            controller: _textController,
                            onSubmitted: _handleSubmitted,
                            decoration: InputDecoration.collapsed(
                                hintText: 'Send a message'),
                          ),
                        ),
                        Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4.0),
                          child: IconButton(
                              icon: const Icon(Icons.send),
                              onPressed: () =>
                                  _handleSubmitted(_textController.text)),
                        )
                      ],
                    ),
                  ))
            ]));
  }

  void _handleSubmitted(String text) {
    _textController.clear();
  }
}
