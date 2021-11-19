import 'package:Colorimage/constants/general.dart';
import 'package:Colorimage/models/chat.dart';
import 'package:Colorimage/providers/messenger.dart';
import 'package:flutter/material.dart';
import 'package:flutter_chat_bubble/bubble_type.dart';
import 'package:flutter_chat_bubble/chat_bubble.dart';
import 'package:flutter_chat_bubble/clippers/chat_bubble_clipper_3.dart';
import 'package:provider/src/provider.dart';

class ChatMessage extends StatelessWidget {
  const ChatMessage({
    required this.channelId,
    required this.text,
    required this.username,
    required this.message_username,
    required this.timestamp,
    required this.messageId,
  });

  final String messageId;
  final String channelId;
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
                          ChatBubble(
                            clipper:
                                ChatBubbleClipper3(type: BubbleType.sendBubble),
                            shadowColor: Colors.white,
                            elevation: 0,
                            alignment: Alignment.topRight,
                            margin: EdgeInsets.only(top: 10),
                            backGroundColor: Colors.indigo.shade400,
                            child: Container(
                              color: Color(0xFF5D72CC),
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
                            child: CircleAvatar(
                                backgroundColor: kPrimaryColor,
                                child: Text(
                                  this.message_username[0],
                                  style: TextStyle(color: Colors.white),
                                )))
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
                                style: TextStyle(
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
  int channelIndex;

  ChatScreen(this.channelIndex, {Key? key}) : super(key: key);

  @override
  _ChatScreenState createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  // final List<dynamic> _messages = [];
  final _textController = TextEditingController();
  bool _validate = false;
  final FocusNode _focusNode = FocusNode();

  void _handleSubmitted(String text) {
    print('submitted');
    setState(() {
      _validate =
          _textController.text.isEmpty || _textController.text.trim().isEmpty;
    });
    if (!_validate) {
      _textController.clear();
      context.read<Messenger>().channelSocket.sendMessage(
          text, context.read<Messenger>().userChannels[widget.channelIndex].id);
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
      data: const IconThemeData(color: kPrimaryColor),
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
                  color: Colors.indigo.shade400,
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
    Messenger messenger = context.read<Messenger>();
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
            icon: const Tooltip(
                message: 'Se déconnecter',
                child: Icon(Icons.arrow_back, color: Colors.white, size: 30)),
            onPressed: () => context.read<Messenger>().toggleSelection()),
        title: const Text(
          '',
          style: TextStyle(fontSize: 25, color: Colors.blue),
        ),
        actions: [
          IconButton(
              icon: const Icon(Icons.history_rounded,
                  color: Colors.white, size: 30),
              onPressed: () {
                showDialog<String>(
                    context: context,
                    builder: (BuildContext context) => AlertDialog(
                          title: Text(
                              'Historique du canal ${messenger.userChannels[widget.channelIndex].name}'),
                          content: const Text(
                              "Voulez-vous obtenir l'historique du canal?"),
                          actions: <Widget>[
                            TextButton(
                              onPressed: () {
                                Navigator.pop(context, 'Non');
                              },
                              child: const Text('Non'),
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.pop(context, 'Oui');
                                messenger
                                    .fetchChannelHistory(widget.channelIndex);
                              },
                              child: const Text('Oui'),
                            ),
                          ],
                        ));
              }),
          messenger.userChannels[widget.channelIndex].name != "Canal Publique"
              ? IconButton(
                  icon: const Icon(Icons.exit_to_app_rounded,
                      color: Colors.white, size: 30),
                  onPressed: () {
                    showDialog<String>(
                        context: context,
                        builder: (BuildContext context) => AlertDialog(
                              title: Text(
                                  'Quitter le canal ${messenger.userChannels[widget.channelIndex].name}'),
                              content: const Text('Êtes-vous certain?'),
                              actions: <Widget>[
                                TextButton(
                                  onPressed: () {
                                    Navigator.pop(context, 'Non');
                                  },
                                  child: const Text('Non'),
                                ),
                                TextButton(
                                  onPressed: () {
                                    Navigator.pop(context, 'Oui');
                                    messenger.channelSocket.leaveChannel(
                                        messenger
                                            .userChannels[widget.channelIndex]
                                            .id);
                                    messenger.toggleSelection();
                                  },
                                  child: const Text('Oui'),
                                ),
                              ],
                            ));
                  })
              : const SizedBox.shrink()
        ],
      ),
      body: Column(
        children: [
          Flexible(
            child: ListView.builder(
              padding: const EdgeInsets.all(8.0),
              reverse: true,
              itemBuilder: (_, index) => context
                  .watch<Messenger>()
                  .userChannels[widget.channelIndex]
                  .messages[index],
              itemCount: context
                  .read<Messenger>()
                  .userChannels[widget.channelIndex]
                  .messages
                  .length,
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
