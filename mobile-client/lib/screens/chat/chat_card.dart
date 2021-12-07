import 'dart:math';

import 'package:Colorimage/models/chat.dart';
import 'package:Colorimage/providers/messenger.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:provider/src/provider.dart';

import '../../constants/general.dart';

class ChatCard extends StatelessWidget {
  const ChatCard({
    Key? key,
    required this.chat,
    required this.user,
    required this.press,
  }) : super(key: key);

  final Chat chat;
  final User user;
  final VoidCallback press;

  getfontWeight() {
    return chat.messages.isEmpty ? const TextStyle(fontSize: 20, fontWeight: FontWeight.w500) :
    chat.lastReadMessage == chat.messages.first.text ?
      const TextStyle(fontSize: 20, fontWeight: FontWeight.w500) :
      const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: kPrimaryColor);
  }

  notifIcon() {
    return chat.messages.isEmpty ? const SizedBox.shrink() :
    chat.lastReadMessage == chat.messages.first.text ?
      const SizedBox.shrink() :
      Icon(
          Icons.circle,
          size: 20,
          color: kPrimaryColor.withOpacity(0.75),
      );
  }

  @override
  Widget build(BuildContext context) {
    Messenger messenger = context.read<Messenger>();
    return InkWell(
      onTap: press,
      child: Padding(
        padding: const EdgeInsets.symmetric(
            horizontal: kDefaultPadding, vertical: kDefaultPadding * 0.75),
        child: Row(
          children: [
            Stack(
              children: [
                CircleAvatar(
                    radius: 24, backgroundColor: Colors.primaries[Random().nextInt(Colors.primaries.length)], child:
                      /*************************** ADD 'nMembers > 1? Group icon : Avatar of only member' ***********************/
                      Icon(Icons.group, color: Colors.black),
                ),
                // if (chat.isActive)
                //   Positioned(
                //     right: 0,
                //     bottom: 0,
                //     child: Container(
                //       height: 16,
                //       width: 16,
                //       decoration: BoxDecoration(
                //         color: Colors.green,
                //         shape: BoxShape.circle,
                //         border: Border.all(
                //             color: Theme.of(context).scaffoldBackgroundColor,
                //             width: 3),
                //       ),
                //     ),
                //   )
              ],
            ),
            Expanded(
              child: Padding(
                padding:
                const EdgeInsets.symmetric(horizontal: kDefaultPadding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      chat.name,
                      style: getfontWeight(),
                    ),
                    SizedBox(height: 8),
                    Opacity(
                      opacity: 0.64,
                      child: Text(
                        // chat.lastMessage,
                        chat.messages.isEmpty ? "" : chat.messages.first.text,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: getfontWeight(),
                      ),
                    ),
                  ],
                ),
              ),
            ),
              notifIcon(),
              if(chat.name != "Public" && user.displayName == chat.ownerUsername && chat.type == 'Public')
                IconButton(
                  iconSize: 28,
                  icon: const Icon(Icons.highlight_remove),
                  color: kErrorColor,
                  onPressed: () {
                    showDialog<String>(
                        context: context,
                        builder: (BuildContext context) => AlertDialog(
                          title: Text('Supprimer le canal ${chat.name}'),
                          content: const Text('Êtes-vous certain?'),
                          actions: <Widget>[
                            TextButton(
                              onPressed: () => Navigator.pop(context, 'Non'),
                              child: const Text('Non'),
                            ),
                            TextButton(
                              onPressed: () {
                                  Navigator.pop(context, 'Oui');
                                  messenger.channelSocket.deleteChannel(chat.id);
                                },
                              child: const Text('Oui'),
                            ),
                          ],
                        ));
                  }),
              // Text(chat.time,
              //   style:
              //     const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),),
          ],
        ),
      ),
    );
  }
}